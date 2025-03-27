# 📌 Installation et Restauration d'une Base de Données PostgreSQL

Ce guide explique comment installer PostgreSQL sur votre machine et restaurer une base de données à partir d'un fichier de dump.

---

## 🛠 1. Installation de PostgreSQL

### 🐧 Sous Linux (Debian/Ubuntu)
```sh
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 🍏 Sous macOS (via Homebrew)
```sh
brew install postgresql
brew services start postgresql
```

### 🖥 Sous Windows
🔗 [Téléchargez PostgreSQL ici](https://www.postgresql.org/download/) et suivez les instructions d'installation en incluant `pgAdmin` et `psql`.

---

## ✅ 2. Vérification de l'installation
Après installation, vérifiez que PostgreSQL fonctionne avec la commande :
```sh
psql --version
```

---

## 🔄 3. Installation de la base de données

### 🚀 3.1 Démarrer PostgreSQL
Sous Linux et macOS :
```sh
sudo systemctl start postgresql
```

Sous Windows, assurez-vous que le service PostgreSQL est démarré via `pgAdmin` ou `services.msc`.

### 🔑 3.2 Connexion à PostgreSQL
Se connecter en tant qu'utilisateur PostgreSQL :
```sh
sudo -u postgres psql
```
Sur Windows :
```sh
psql -U postgres
```

### 🏗 3.3 Création de la base de données
Si la base de données mentionnée dans le dump n'existe pas, elle porte le nom **"muller"**. Créez-la avec :
```sh
CREATE DATABASE muller;
```

### 📂 3.4 Importation du dump
Quittez `psql` avec `\q` puis exécutez la commande suivante :
```sh
psql -U postgres -d muller -f /chemin/vers/sql.dump
```
📝 Remplacez `/chemin/vers/sql.dump` par le chemin réel du fichier dump.

---

## 🔍 4. Vérification de l'importation
Reconnectez-vous à PostgreSQL et vérifiez les tables :
```sh
psql -U postgres -d muller
\dt
```
Cela affichera les tables importées.

---

## ⚠️ 5. Problèmes courants et solutions
- ❌ **Erreur d'authentification** : Essayez d'ajouter `-W` à la commande `psql` pour forcer la demande de mot de passe.
- 📁 **Fichier non trouvé** : Assurez-vous que le chemin du fichier dump est correct.
- 🔄 **Base de données existante** : Si la base existe déjà et contient des données, vous devrez peut-être la supprimer avant (`DROP DATABASE muller;`).

---

🎉 **Votre base de données PostgreSQL est maintenant installée et restaurée !** 🚀

