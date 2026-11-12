plugins {
    kotlin("jvm") version "2.3.0"
    application
}
repositories { google(); mavenCentral() }
dependencies {
    implementation("com.google.ai.edge.litertlm:litertlm-jvm:latest.release")
    implementation("org.json:json:20240303")
}
kotlin { jvmToolchain(17) }
application { mainClass.set("MainKt") }
