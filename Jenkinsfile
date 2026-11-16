
pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-hub_credentials')

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    docker build \
                      -t $DOCKERHUB_USERNAME/react-frontend:$IMAGE_TAG \
                      ./frontend
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    docker build \
                      -t $DOCKERHUB_USERNAME/react-backend:$IMAGE_TAG \
                      ./backend
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login \
                        -u "$DOCKERHUB_CREDENTIALS_USR" \
                        --password-stdin

                    docker push $DOCKERHUB_CREDENTIALS_USR/react-frontend:$IMAGE_TAG
                    docker push $DOCKERHUB_CREDENTIALS_USR/react-backend:$IMAGE_TAG

                    docker logout
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    cd /opt/cicd-project

                    export DOCKERHUB_USERNAME="$DOCKERHUB_CREDENTIALS_USR"
                    export IMAGE_TAG="$IMAGE_TAG"

                    docker compose pull
                    docker compose up -d --remove-orphans
                '''
            }
        }
    }
}
