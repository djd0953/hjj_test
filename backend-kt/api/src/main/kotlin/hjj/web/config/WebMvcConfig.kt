package hjj.web.config

import hjj.web.interceptor.AuthInterceptor
import hjj.web.interceptor.RequestTimingInterceptor
import hjj.web.resolver.LoginUserArgumentResolver
import org.springframework.context.annotation.Configuration
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebMvcConfig(
    private val authInterceptor: AuthInterceptor,
    private val requestTimingInterceptor: RequestTimingInterceptor,
    private val loginUserArgumentResolver: LoginUserArgumentResolver
): WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(requestTimingInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns("/error")

        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/auth/**",
                "/error",
                "/docs",
                "/swagger-ui/**",
                "/v3/api-docs/**"
            )
    }

    override fun addArgumentResolvers(resolvers: MutableList<HandlerMethodArgumentResolver>) {
        resolvers.add(loginUserArgumentResolver)
    }
}