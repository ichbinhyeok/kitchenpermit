FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN addgroup --system hood \
    && adduser --system --ingroup hood --home /app hood \
    && mkdir -p /app/storage \
    && chown -R hood:hood /app

COPY build/libs/*.jar /app/app.jar

USER hood

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
