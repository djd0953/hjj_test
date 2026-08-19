import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.tasks.KotlinJvmCompile

plugins {
	base
	alias(libs.plugins.kotlin.jvm) apply false
	alias(libs.plugins.kotlin.spring) apply false
	alias(libs.plugins.spring.boot.framework) apply false
	alias(libs.plugins.spring.dependency.management) apply false
}

allprojects {
	group = "hjj"
	version = "0.0.1"
}

subprojects {
	plugins.withId("org.jetbrains.kotlin.jvm") {
		extensions.configure<JavaPluginExtension> {
			toolchain {
				languageVersion.set(JavaLanguageVersion.of(21))
			}
		}
	}

	tasks.withType<KotlinJvmCompile>().configureEach {
		compilerOptions {
			jvmTarget.set(JvmTarget.JVM_21)
			freeCompilerArgs.addAll("-Xjsr305=strict", "-Xannotation-default-target=param-property")
		}
	}

	tasks.withType<Test>().configureEach {
		useJUnitPlatform()
	}
}