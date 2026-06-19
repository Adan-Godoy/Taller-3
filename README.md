
# Drive Clone - Taller 3 

## Herramientas y Tecnologías Utilizadas

*   **Node.js** (Versión recomendada >= 20.0.0)
*   **Docker & Docker Compose** (Para levantar MongoDB y LocalStack)
*   **Terraform** (Para el aprovisionamiento de infraestructura de S3)
*   **Git** (Gestión de versiones con estándar *Conventional Commits*)
*   **AWS CLI** (Opcional, para verificación rápida por consola)

## Estructura del Proyecto

```text
taller3-drive-clone/
│
├── backend/               # Servidor API desarrollado con NestJS
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/              # Aplicación Web desarrollada con Next.js 
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── terraform/             # Código de aprovisionamiento de S3 en LocalStack
│   └── main.tf
│
├── docker-compose.yml     # Orquestación de MongoDB y LocalStack
└── .gitignore             # Archivos excluidos del control de versiones
```

---

## Variables de Entorno y Configuración

Los puertos y conexiones por defecto preconfigurados en el código son los siguientes:

### Backend (NestJS) - Corre en puerto `3000`
*   `MONGO_URI`: `mongodb://localhost:27017/driveclone` (Conexión local a la DB)
*   `LOCALSTACK_ENDPOINT`: `http://localhost:4566` (Simulador de S3)
*   `BUCKET_NAME`: `taller3-drive-bucket` (Bucket aprovisionado en S3)

### Frontend (Next.js) - Corre en puerto `3001`
*   `NEXT_PUBLIC_API_URL`: `http://localhost:3000` (Conexión directa con la API del Backend)

---

## Guía de Instalación y Ejecución Paso a Paso

### 1. Clonar el repositorio
Abre una terminal y clona el proyecto desde tu cuenta de GitHub:
```bash
git clone https://github.com/Adan-Godoy/Taller-3.git
cd Taller-3
```

### 2. Levantar la Infraestructura Local (Docker)
En la raíz de la carpeta clonada, inicia los contenedores de MongoDB y LocalStack en segundo plano:
```bash
docker-compose up -d
```

### 3. Aprovisionar el Bucket S3 (Terraform)
Entra a la carpeta de Terraform, inicializa y aplica los recursos en el LocalStack activo:
```bash
cd terraform
terraform init
terraform apply -auto-approve
cd ..
```
*Esto creará físicamente el bucket `taller3-drive-bucket` de S3 en tu LocalStack.*

### 4. Configurar y Arrancar el Backend (NestJS)
Entra a la carpeta del backend, instala sus dependencias y arranca el servidor en modo desarrollo:
```bash
cd backend
npm install
npm run start:dev
```
*El backend compilará y se quedará a la escucha en el puerto `http://localhost:3000`.*

### 5. Configurar y Arrancar el Frontend (Next.js)
En una **nueva pestaña de la terminal**, dirígete a la carpeta del frontend, instala las dependencias y corre el servidor cliente:
```bash
cd frontend
npm install
npm run dev
```
*El frontend se iniciará y estará accesible en tu navegador en la URL: `http://localhost:3001`.*
