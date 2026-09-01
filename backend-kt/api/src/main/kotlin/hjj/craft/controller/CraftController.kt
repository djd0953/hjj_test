package hjj.craft.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/craft")
class CraftController() {
    @GetMapping()
    fun test() = "hello"
}