plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kover)
}

dependencies {
    implementation(project(":core"))
    implementation(platform(libs.aws.sdk.bom))
    implementation(libs.aws.sdk.signin)
    implementation(libs.aws.sdk.s3)
}