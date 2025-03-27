# 🌟 Installation et lancement d'un projet React avec Vite 🚀

## 📌 Prérequis
Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
- 📥 [Node.js](https://nodejs.org/) (version recommandée : LTS)
- 📦 [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/) (npm est inclus avec Node.js)

---

## 💻 Installation de Node.js

### 🖥️ Sur Windows
1. 🔗 Rendez-vous sur le site officiel de Node.js : [https://nodejs.org/](https://nodejs.org/)
2. 📥 Téléchargez la version **LTS (Long Term Support)**.
3. 📌 Exécutez l'installateur et suivez les instructions.
4. ✅ Vérifiez l'installation en exécutant dans un terminal :
   ```sh
   node -v
   ```
   Cela devrait afficher la version de Node.js installée.
5. ✅ Vérifiez également npm :
   ```sh
   npm -v
   ```

### 🐧 Sur Linux
1. 🔄 Mettez à jour les paquets :
   ```sh
   sudo apt update && sudo apt upgrade -y
   ```
2. ⚡ Installez Node.js et npm via NodeSource :
   ```sh
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
3. ✅ Vérifiez l'installation :
   ```sh
   node -v
   npm -v
   ```

---

## 📂 Installation des dépendances du projet


```sh
cd mon-projet/react
```

Ensuite, installez les dépendances :

🔹 Avec **npm** :
```sh
npm install
```

🔹 Avec **yarn** :
```sh
yarn install
```

🔹 Avec **pnpm** :
```sh
pnpm install
```

---

## 🚀 Lancer le projet

Une fois l'installation terminée, démarrez le serveur de développement :

🟢 Avec **npm** :
```sh
npm run dev
```

🟣 Avec **yarn** :
```sh
yarn dev
```

🟡 Avec **pnpm** :
```sh
pnpm dev
```

🔗 Le terminal affichera une URL du type **`http://localhost:5173/`** où vous pourrez voir votre application.

---
🎉 **Votre projet React avec Vite est maintenant prêt !** 🚀🔥
