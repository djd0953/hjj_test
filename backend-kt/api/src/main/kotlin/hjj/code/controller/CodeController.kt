package hjj.code.controller

import hjj.authentication.annotation.LoginUser
import hjj.authentication.model.AuthUser
import hjj.code.constant.SnippetPermission
import hjj.code.response.CodeRunResponse
import hjj.code.service.CodeService
import hjj.web.error.exception.ApiErrorCode
import hjj.web.error.exception.MessageException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/code")
class CodeController (
    private val codeService: CodeService
) {
    @GetMapping("/list")
    fun list() = codeService.list()

    @GetMapping("/{keyword}")
    fun run(
        @PathVariable keyword: String,
        @LoginUser authUser: AuthUser?
    ): CodeRunResponse {
        val permission = codeService.permissionOf(keyword)
        if (permission == SnippetPermission.PRIVATE && authUser == null)
            throw MessageException(ApiErrorCode.UNAUTHORIZED)

        return codeService.run(keyword)
    }
}