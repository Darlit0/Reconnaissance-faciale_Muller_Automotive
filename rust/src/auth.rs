use serde::Serialize;
use axum::{
    extract::{State, Multipart},
    http::StatusCode,
};
use std::sync::Arc;
use pyo3::prelude::*;
use pyo3::types::{PyBytes, PyList};
use crate::AppState;

#[derive(Serialize)]
pub struct UserId {
    pub id: i32,
}

pub async fn login_handler(
    State(state): State<Arc<AppState>>, 
    mut multipart: Multipart
) -> Result<String, (StatusCode, String)> {
    // Extraire l'image du formulaire multipart
    let mut image_data = Vec::new();
    
    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (StatusCode::BAD_REQUEST, format!("Erreur lors de l'extraction du fichier: {}", e))
    })? {
        if field.name() == Some("file") {
            // Lire les données du fichier
            let data = field.bytes().await.map_err(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Erreur de lecture du fichier: {}", e))
            })?;
            
            image_data = data.to_vec();
            break; // On ne prend que la première image
        }
    }

    let seuil = match state.seuil.read() {
        Ok(seuil_value) => *seuil_value,
        Err(_) => {
            eprintln!("Impossible de lire la valeur du seuil, utilisation de la valeur par défaut 0.6");
            0.6 // Valeur par défaut si la lecture échoue
        }
    };
    
    if image_data.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Aucune image fournie".to_string()));
    }
    
    // Récupérer toutes les images des utilisateurs
    let rows = state.db_client.query(
        "SELECT id_utilisateur, image FROM images WHERE id_utilisateur IS NOT NULL", 
        &[]
    ).await.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Erreur de base de données: {}", e))
    })?;
    
    // Construire une structure de données pour Python (seulement les images)
    let mut images_data = Vec::new();
    let mut user_ids = Vec::new();
    
    for row in &rows {
        let user_id: i32 = row.get(0);
        
        // Modification pour prendre en compte le type _bytea (tableau de bytea)
        let db_image = match row.try_get::<_, Vec<Vec<u8>>>(1) {
            Ok(array_of_bytea) => {
                // Si c'est un tableau, prendre le premier élément
                if let Some(first_bytea) = array_of_bytea.first() {
                    first_bytea.clone()
                } else {
                    // Tableau vide
                    continue;
                }
            },
            Err(_) => {
                // Si ce n'est pas un tableau, essayer de récupérer comme un bytea simple
                match row.try_get::<_, Vec<u8>>(1) {
                    Ok(bytea) => bytea,
                    Err(e) => {
                        // Si tout échoue, logger l'erreur et sauter cette ligne
                        eprintln!("Erreur lors de la récupération de l'image: {}", e);
                        continue;
                    }
                }
            }
        };
        
        // Stocker seulement l'image pour Python
        images_data.push(db_image);
        // Stocker l'ID utilisateur séparément pour une utilisation ultérieure
        user_ids.push(user_id);
    }
    
    // Appeler la fonction Python pour obtenir l'index de l'image correspondante
    let match_index: Option<usize> = Python::with_gil(|py| {
        // Convertir les données en objets Python
        let uploaded_image = PyBytes::new(py, &image_data);
        
        // Créer une liste d'images uniquement (sans les IDs)
        let images_list = PyList::new(py, images_data.iter().map(|img_data| {
            PyBytes::new(py, img_data)
        }));
        
        // Charger le module Python et appeler la fonction compare_image
        let module = PyModule::from_code(
            py, 
            include_str!("functions/faceReco.py"), 
            "faceReco.py", 
            "faceReco"
        ).unwrap_or_else(|e| {
            eprintln!("Erreur lors du chargement du module Python: {}", e);
            panic!("Échec du chargement du module Python");
        });
        // Appeler la fonction compare_image et extraire l'index
        match module.getattr("compare_image")
            .and_then(|func| func.call1((uploaded_image, images_list, seuil)))
        {
            Ok(res) => {
                match res.extract::<Option<usize>>() {
                    Ok(Some(idx)) => Some(idx),
                    Ok(None) => None,
                    Err(e) => {
                        eprintln!("Erreur lors de l'extraction de l'index: {}", e);
                        None
                    }
                }
            },
            Err(e) => {
                eprintln!("Erreur lors de l'appel de la fonction Python: {}", e);
                None
            }
        }
    });
    
    // Utiliser l'index renvoyé par Python pour obtenir l'ID utilisateur correspondant
    let user_id = match match_index {
        Some(idx) if idx < user_ids.len() => Some(user_ids[idx]),
        _ => None
    };
    
    // Vérifier si un utilisateur a été identifié
    match user_id {
        Some(id) => {
            // Récupérer les informations de l'utilisateur
            match state.db_client.query_one(
                "SELECT nom, prenom, role FROM users WHERE id = $1", 
                &[&id]
            ).await {
                Ok(row) => {
                    let nom: String = row.get(0);
                    let prenom: String = row.get(1);
                    let role: String = row.get(2);
                    
                    // Définir l'utilisateur comme connecté
                    if let Ok(mut connected) = state.is_connected.write() {
                        *connected = true;
                    }
                    
                    // Vérifier si l'utilisateur est administrateur
                    if let Ok(mut admin) = state.is_admin.write() {
                        *admin = role.to_lowercase() == "admin";
                    }
                    
                    Ok(format!("Utilisateur trouvé: {} {}", prenom, nom))
                },
                Err(e) => {
                    // Utilisateur non trouvé dans la table users
                    if let Ok(mut connected) = state.is_connected.write() {
                        *connected = false;
                    }
                    if let Ok(mut admin) = state.is_admin.write() {
                        *admin = false;
                    }
                    
                    Err((StatusCode::NOT_FOUND, format!("Aucun utilisateur trouvé avec l'ID: {} (Erreur: {})", id, e)))
                }
            }
        },
        None => {
            // Aucun utilisateur identifié par la reconnaissance faciale
            if let Ok(mut connected) = state.is_connected.write() {
                *connected = false;
            }
            if let Ok(mut admin) = state.is_admin.write() {
                *admin = false;
            }
            
            Err((StatusCode::UNAUTHORIZED, "Aucun utilisateur reconnu".to_string()))
        }
    }
}

pub async fn logout_handler(State(state): State<Arc<AppState>>) -> String {
    // Réinitialiser les drapeaux is_connected et is_admin
    if let Ok(mut connected) = state.is_connected.write() {
        *connected = false;
    }
    
    if let Ok(mut admin) = state.is_admin.write() {
        *admin = false;
    }
    
    // Retourner un message de confirmation
    "Déconnexion réussie".to_string()
}