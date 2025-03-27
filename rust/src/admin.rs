use axum::{
    extract::{Path, State, Multipart},
    routing::{get, post, put, delete},
    Router, Json, response::IntoResponse, http::StatusCode
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::AppState;
use base64::Engine;

#[derive(Serialize, Deserialize)]
pub struct User {
    pub id: Option<i32>,
    pub nom: String,
    pub prenom: String,
    pub role: String,
}

#[derive(Serialize)]
pub struct ApiResponse {
    success: bool,
    message: String,
}


// Check if user is admin, return a Result containing the state or an error response
async fn check_admin(state: &Arc<AppState>) -> Result<(), (StatusCode, Json<ApiResponse>)> {
    // Check the admin flag
    let is_admin = {
        match state.is_admin.read() {
            Ok(admin_flag) => *admin_flag,
            Err(_) => false,
        }
    };

    // Check the connected flag
    let is_connected = {
        match state.is_connected.read() {
            Ok(connected_flag) => *connected_flag,
            Err(_) => false,
        }
    };

    if !is_connected {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse {
                success: false,
                message: "Veuillez vous connecter".to_string(),
            }),
        ));
    }

    if !is_admin {
        return Err((
            StatusCode::FORBIDDEN,
            Json(ApiResponse {
                success: false,
                message: "Accès réservé aux administrateurs".to_string(),
            }),
        ));
    }

    Ok(())
}

// Create the admin routes
pub fn admin_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users", get(get_all_users))
        .route("/users/{id}", get(get_user_by_id))
        .route("/users", post(create_user))
        .route("/users/{id}", put(update_user))
        .route("/users/{id}", delete(delete_user))
        .route("/upload-images/{id}", post(upload_images))
        .route("/images/{id}", get(get_user_images))
        .route("/last-user", get(get_last_created_user))
        .route("/changeSeuil", post(change_seuil))
}


// GET the last created user
async fn get_last_created_user(
    State(state): State<Arc<AppState>>,
) -> Result<Json<User>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Get the last created user from database (assuming ID is auto-incremented)
    match state.db_client.query_one(
        "SELECT id, nom, prenom, role FROM users ORDER BY id DESC LIMIT 1", 
        &[]
    ).await {
        Ok(row) => {
            let user = User {
                id: Some(row.get(0)),
                nom: row.get(1),
                prenom: row.get(2),
                role: row.get(3),
            };
            Ok(Json(user))
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la récupération du dernier utilisateur: {}", e),
                }),
            ))
        }
    }
}

// GET all users
async fn get_all_users(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<User>>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Get all users from database
    match state.db_client.query("SELECT id, nom, prenom, role FROM users ORDER BY id", &[]).await {
        Ok(rows) => {
            let users: Vec<User> = rows
                .into_iter()
                .map(|row| User {
                    id: Some(row.get(0)),
                    nom: row.get(1),
                    prenom: row.get(2),
                    role: row.get(3),
                })
                .collect();
            Ok(Json(users))
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la récupération des utilisateurs: {}", e),
                }),
            ))
        }
    }
}

// GET a user by ID
async fn get_user_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> Result<Json<User>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Get user by ID
    match state.db_client.query_one("SELECT id, nom, prenom, role FROM users WHERE id = $1", &[&id]).await {
        Ok(row) => {
            let user = User {
                id: Some(row.get(0)),
                nom: row.get(1),
                prenom: row.get(2),
                role: row.get(3),
            };
            Ok(Json(user))
        },
        Err(_) => {
            Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse {
                    success: false,
                    message: format!("Utilisateur avec l'ID {} non trouvé", id),
                }),
            ))
        }
    }
}

// CREATE a new user
async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(user): Json<User>,
) -> Result<impl IntoResponse, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Validate user data
    if user.nom.is_empty() || user.prenom.is_empty() || user.role.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                success: false,
                message: "Tous les champs sont obligatoires".to_string(),
            }),
        ));
    }

    // Insert user into database
    match state.db_client
        .query_one(
            "INSERT INTO users (nom, prenom, role) VALUES ($1, $2, $3) RETURNING id",
            &[&user.nom, &user.prenom, &user.role],
        )
        .await
    {
        Ok(row) => {
            let id: i32 = row.get(0);
            Ok((
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    message: format!("Utilisateur créé avec l'ID {}", id),
                }),
            ))
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la création de l'utilisateur: {}", e),
                }),
            ))
        }
    }
}

// UPDATE a user
async fn update_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
    Json(user): Json<User>,
) -> Result<Json<ApiResponse>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Validate user data
    if user.nom.is_empty() || user.prenom.is_empty() || user.role.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                success: false,
                message: "Tous les champs sont obligatoires".to_string(),
            }),
        ));
    }

    // Update user in database
    match state.db_client
        .execute(
            "UPDATE users SET nom = $1, prenom = $2, role = $3 WHERE id = $4",
            &[&user.nom, &user.prenom, &user.role, &id],
        )
        .await
    {
        Ok(rows) => {
            if rows > 0 {
                Ok(Json(ApiResponse {
                    success: true,
                    message: format!("Utilisateur avec l'ID {} mis à jour", id),
                }))
            } else {
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ApiResponse {
                        success: false,
                        message: format!("Utilisateur avec l'ID {} non trouvé", id),
                    }),
                ))
            }
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la mise à jour de l'utilisateur: {}", e),
                }),
            ))
        }
    }
}

// DELETE a user
// DELETE a user
async fn delete_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i32>,
) -> Result<Json<ApiResponse>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // First, delete associated images from the images table
    match state.db_client
        .execute("DELETE FROM images WHERE id_utilisateur = $1", &[&id])
        .await 
    {
        Ok(_) => {
            // Now that images are deleted, delete the user
            match state.db_client
                .execute("DELETE FROM users WHERE id = $1", &[&id])
                .await
            {
                Ok(rows) => {
                    if rows > 0 {
                        Ok(Json(ApiResponse {
                            success: true,
                            message: format!("Utilisateur avec l'ID {} supprimé", id),
                        }))
                    } else {
                        Err((
                            StatusCode::NOT_FOUND,
                            Json(ApiResponse {
                                success: false,
                                message: format!("Utilisateur avec l'ID {} non trouvé", id),
                            }),
                        ))
                    }
                },
                Err(e) => {
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse {
                            success: false,
                            message: format!("Erreur lors de la suppression de l'utilisateur: {}", e),
                        }),
                    ))
                }
            }
        },
        Err(e) => {
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la suppression des images associées: {}", e),
                }),
            ))
        }
    }
}


async fn get_user_images(
    State(state): State<Arc<AppState>>,
    Path(id_utilisateur): Path<i32>,
) -> Result<Json<Vec<String>>, impl IntoResponse> {
    // Vérifier si l'utilisateur est administrateur
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Récupérer les images de l'utilisateur depuis la base de données
    match state.db_client
        .query_one(
            "SELECT image FROM images WHERE id_utilisateur = $1",
            &[&id_utilisateur],
        )
        .await
    {
        Ok(row) => {
            // Récupérer le tableau bytea[]
            let images: Vec<Vec<u8>> = row.get(0);
            
            // Convertir chaque image en Base64 manuellement pour l'envoyer au frontend
            let base64_images: Vec<String> = images
                .into_iter()
                .map(|img| {
                    // Utiliser la fonction standard de la bibliothèque pour encoder en base64
                    let base64 = base64::engine::general_purpose::STANDARD.encode(&img);
                    format!("data:image/jpeg;base64,{}", base64)
                })
                .collect();

            Ok(Json(base64_images))
        },
        Err(_) => {
            Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse {
                    success: false,
                    message: format!("Aucune image trouvée pour l'utilisateur avec l'ID {}", id_utilisateur),
                }),
            ))
        }
    }
}

// Modifier la fonction upload_images pour ajouter des images plutôt que de les remplacer
async fn upload_images(
    State(state): State<Arc<AppState>>,
    Path(id_utilisateur): Path<i32>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse>, impl IntoResponse> {
    // Check if user is admin
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }

    // Vérifier si l'utilisateur existe
    match state.db_client.query_one(
        "SELECT id FROM users WHERE id = $1", 
        &[&id_utilisateur]
    ).await {
        Ok(_) => {},
        Err(_) => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ApiResponse {
                    success: false,
                    message: format!("Utilisateur avec l'ID {} non trouvé", id_utilisateur),
                }),
            ));
        }
    }

    // Vecteur pour stocker les nouvelles images en bytea
    let mut new_image_bytes_vec: Vec<Vec<u8>> = Vec::new();

    // Traiter chaque partie de la requête multipart
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                success: false,
                message: format!("Erreur lors de la lecture du formulaire multipart: {}", e),
            }),
        )
    })? {
        // Vérifier que le champ contient une image
        let content_type = field.content_type().unwrap_or("").to_string();
        if !content_type.starts_with("image/") {
            continue; // Ignorer les champs qui ne sont pas des images
        }

        // Lire les données du fichier
        let data = field.bytes().await.map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse {
                    success: false,
                    message: format!("Erreur lors de la lecture des données du fichier: {}", e),
                }),
            )
        })?;

        // Ajouter les données au vecteur des nouvelles images
        new_image_bytes_vec.push(data.to_vec());
    }

    // Vérifier si des images ont été trouvées
    if new_image_bytes_vec.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                success: false,
                message: "Aucune image valide n'a été fournie".to_string(),
            }),
        ));
    }

    // Vérifier si l'utilisateur a déjà des images
    let existing_images_result = state.db_client
        .query_opt(
            "SELECT image FROM images WHERE id_utilisateur = $1",
            &[&id_utilisateur],
        )
        .await;
    
    match existing_images_result {
        Ok(Some(_)) => {
            // L'utilisateur a déjà des images, on les remplace
            match state.db_client
                .execute(
                    "UPDATE images SET image = $1 WHERE id_utilisateur = $2",
                    &[&new_image_bytes_vec, &id_utilisateur],
                )
                .await
            {
                Ok(_) => {
                    Ok(Json(ApiResponse {
                        success: true,
                        message: format!("Images remplacées pour l'utilisateur {}", id_utilisateur),
                    }))
                },
                Err(e) => {
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse {
                            success: false,
                            message: format!("Erreur lors de la mise à jour des images: {}", e),
                        }),
                    ))
                }
            }
        },
        Ok(None) | Err(_) => {
            // L'utilisateur n'a pas encore d'images, on crée un nouvel enregistrement
            match state.db_client
                .execute(
                    "INSERT INTO images (id_utilisateur, image) VALUES ($1, $2)",
                    &[&id_utilisateur, &new_image_bytes_vec],
                )
                .await
            {
                Ok(_) => {
                    Ok(Json(ApiResponse {
                        success: true,
                        message: format!("Images ajoutées pour l'utilisateur {}", id_utilisateur),
                    }))
                },
                Err(e) => {
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ApiResponse {
                            success: false,
                            message: format!("Erreur lors de l'ajout des images: {}", e),
                        }),
                    ))
                }
            }
        }
    }
}

// Struture pour la requête de changement de seuil
#[derive(Deserialize)]
pub struct SeuilRequest {
    pub seuil: f64,
}

// Fonction pour changer le seuil
async fn change_seuil(
    State(state): State<Arc<AppState>>,
    Json(request): Json<SeuilRequest>,
) -> Result<Json<ApiResponse>, impl IntoResponse> {
    // Vérifier si l'utilisateur est administrateur
    if let Err(response) = check_admin(&state).await {
        return Err(response);
    }


    {
        let mut seuil_value = state.seuil.write().unwrap_or_else(|_| {
            panic!("Erreur lors de l'accès à la variable seuil")
        });
        *seuil_value = request.seuil /100.0;
    }

    // Renvoyer une réponse de succès
    Ok(Json(ApiResponse {
        success: true,
        message: format!("Seuil mis à jour à {}", request.seuil),
    }))
}