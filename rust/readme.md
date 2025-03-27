# Installation de Rust et Axum 🚀

Ce guide explique comment installer Rust et Axum pour développer une API web avec ce framework.

## 1️⃣ Installer Rust 🦀
Rust s'installe avec `rustup`, l'outil officiel de gestion des versions de Rust.

### 🔹 Sous Linux et macOS
Ouvrez un terminal et exécutez :
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
Ensuite, ajoutez Rust à votre `PATH` :
```sh
source $HOME/.cargo/env
```

### 🔹 Sous Windows
Téléchargez et exécutez le programme d'installation depuis [https://rustup.rs](https://rustup.rs).

Vérifiez ensuite l'installation avec :
```sh
rustc --version
```

---


## 4️⃣ Lancer le serveur 🚀
Compilez et exécutez votre serveur avec :
```sh
cargo run
```
Si tout fonctionne, vous devriez voir ce message :
```
🚀 Serveur en cours d'exécution sur http://127.0.0.1:3001
```

---

Votre serveur Axum est prêt ! 🎉🔥

---



# 🔍 Installation de Face Recognition sur Windows et Linux  

Ce tutoriel vous guide à travers l'installation de la bibliothèque **Face Recognition** en Python sous Windows et Linux.

---

## 🟢 Installation sur Windows  

### 1️⃣ Installation de Python et des dépendances  
Assurez-vous que **Python** et **pip** sont installés sur votre machine.  

1. Téléchargez **get-pip.py** et exécutez :  
   ```sh
   python get-pip.py
   ```  
2. Installez OpenCV et NumPy :  
   ```sh
   pip install opencv-python numpy
   ```  
3. Installez **CMake** :  
   ```sh
   pip install cmake
   ```  
4. Installez **dlib** :  
   ```sh
   pip install dlib
   ```  

### ⚠️ Problème avec CMake lors de l'installation de dlib ?  
Si vous rencontrez une erreur liée à **CMake**, installez **Visual Studio Build Tools** :  
👉 [Télécharger Visual Studio Installer](https://visualstudio.microsoft.com/fr/visual-cpp-build-tools/)  
- Lors de l'installation, cochez l'option **C++ Build Tools**.  
- Ensuite, réessayez d'installer **dlib**.  

5. Installez **Face Recognition** :  
   ```sh
   pip install face-recognition
   ```  

---

## 🔵 Installation sur Linux  

### 1️⃣ Vérification et installation de Python  
Vérifiez si Python est installé :  
```sh
python3 --version
```  
Si Python n'est pas installé, installez-le :  
```sh
sudo apt install python3 -y
```  

### 2️⃣ Installation de pip et de l’environnement virtuel  
```sh
sudo apt install python3-pip -y
pip3 --version
python3 -m venv ./mon_env
source ../../mon_env/bin/activate

```  

### 3️⃣ Installation des dépendances  
```sh
pip install numpy opencv-python dlib face-recognition
pip install --upgrade setuptools
pip install face-recognition-models
```  

### 4️⃣ Installation de **direnv** (gestion des environnements virtuels)  
```sh
sudo apt install direnv
```  

### 5️⃣ Configuration de `direnv`  

🔹 **Pour Bash** :  
```sh
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```  
🔹 **Pour Zsh** :  
```sh
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```  

### 6️⃣ Activation de l’environnement virtuel  
Dans votre dossier de projet :  
```sh
cd /chemin/vers/votre/projet  
direnv allow .  
touch .envrc  
nano .envrc  
```  

Ajoutez les lignes suivantes dans **.envrc** :  
```sh
#!/bin/bash
source /home/utilisateur/projets/mon_env/bin/activate
echo "Environnement Python activé pour le projet"
```  
Enregistrez (Ctrl+X → Y → Entrée), puis exécutez :  
```sh
direnv allow .
```  

---

✅ **Face Recognition est maintenant installé et prêt à être utilisé !** 🎉
