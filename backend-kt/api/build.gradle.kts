plugins {
	alias(libs.plugins.kotlin.jvm)
	alias(libs.plugins.kotlin.spring)
	alias(libs.plugins.spring.boot.framework)
	alias(libs.plugins.spring.dependency.management)
}

tasks.bootJar {
	archiveFileName.set("api.jar")
}

dependencies {
	implementation(project(":core"))
	implementation(project(":infrastructure"))

	implementation(libs.spring.security.crypto)
	implementation(libs.springdoc.openapi)

	testImplementation(libs.spring.boot.starter.test)
}