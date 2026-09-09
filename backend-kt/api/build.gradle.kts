plugins {
	alias(libs.plugins.kotlin.jvm)
	alias(libs.plugins.kotlin.spring)
	alias(libs.plugins.spring.boot.framework)
	alias(libs.plugins.spring.dependency.management)
	alias(libs.plugins.kover)
}

tasks.bootJar {
	archiveFileName.set("api.jar")
}

dependencies {
	implementation(project(":core"))
	implementation(project(":infrastructure"))

	implementation(libs.spring.boot.starter.web)
	// 암호화
	implementation(libs.spring.security.crypto)
	// swagger
	implementation(libs.springdoc.openapi)
	// aws
	implementation(platform(libs.aws.sdk.bom))
	implementation(libs.aws.sdk.signin)
	implementation(libs.aws.sdk.s3)
	// jwt
	implementation(libs.jjwt.api)
	runtimeOnly(libs.jjwt.impl)
	runtimeOnly(libs.jjwt.jackson)
	// HTML DOM 변환
	implementation(libs.jsoup)

	testImplementation(libs.spring.boot.starter.test)
}
