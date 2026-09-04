plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    implementation(project(":core"))
    implementation(platform(libs.aws.sdk.bom))
    implementation(libs.aws.sdk.signin)
    implementation(libs.aws.sdk.s3)
}