use axum::{
    routing::{post},
    Router,
    http::Method,
};
use tower_http::cors::{CorsLayer, AllowOrigin};
use axum::http::HeaderName;
use std::net::SocketAddr;
use std::sync::{Arc, RwLock};
use tokio::net::TcpListener;
use tokio_postgres::{Client, NoTls};

// Déclaration des modules
mod auth;
mod admin;

pub struct AppState {
    db_client: Client,
    is_admin: Arc<RwLock<bool>>,
    is_connected: Arc<RwLock<bool>>,
    seuil: RwLock<f64>,
}



#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connexion à PostgreSQL
    let (client, connection) = tokio_postgres::connect(
        "host=localhost user=nawfel password=nawfel dbname=muller",
        NoTls
    ).await?;

    // Exécutez la connexion PostgreSQL en arrière-plan
    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("Erreur de connexion: {}", e);
        }
    });

    // Initialisation des variables globales
    let is_admin = Arc::new(RwLock::new(false));
    let is_connected = Arc::new(RwLock::new(false));
    let seuil = RwLock::new(0.6);
    let shared_state = Arc::new(AppState {
        db_client: client,
        is_admin: is_admin.clone(),
        is_connected: is_connected.clone(),
        seuil: seuil,
    });

    
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::predicate(|_, _| true))  // Autorise toutes les origines de façon sécurisée
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ])
        .allow_credentials(true);

    // Construire notre application avec les routes
    let app = Router::new()
        .route("/auth/login", post(auth::login_handler))
        .route("/auth/logout", post(auth::logout_handler))
        .nest("/admin", admin::admin_routes())
        .with_state(shared_state)
        .layer(cors); 

    // Démarrer le serveur
    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("Serveur démarré sur http://{}", addr);
    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}