package com.zepro.controller;

import com.zepro.model.CoordinatorRule;
import com.zepro.service.RuleService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/coordinator")
public class CoordinatorController {

    private final RuleService ruleService;

    public CoordinatorController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    @PostMapping("/rules")
    public CoordinatorRule updateRules(@RequestBody CoordinatorRule rule) {
        return ruleService.updateRule(rule);
    }
}