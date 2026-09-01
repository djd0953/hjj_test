plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.dependency.management)
}

dependencies {
    api(libs.spring.boot.starter.web)
    implementation(libs.kotlin.reflect)
    testImplementation(libs.spring.boot.starter.test)
}
