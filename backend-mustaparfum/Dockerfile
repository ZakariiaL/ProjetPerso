# Étape 1 : builder le projet
FROM maven:3.9.3-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : image finale
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Crée le dossier de stockage image
RUN mkdir /uploads
VOLUME /uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
