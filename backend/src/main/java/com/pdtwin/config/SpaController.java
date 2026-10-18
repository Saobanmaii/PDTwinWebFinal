package com.pdtwin.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/{path:^(?!api$|assets$|unity$|uploads$)[^\\.]*$}",
        "/{path:^(?!api$|assets$|unity$|uploads$)[^\\.]*$}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
