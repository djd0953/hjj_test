package hjj.code.controller

import hjj.code.service.CodeService
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
    fun run(@PathVariable keyword: String) = codeService.run(keyword)
}