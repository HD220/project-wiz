## Mandatory Validation Checklist
1. **Core Principles Compliance**  
   - [ ] Clean Code Validation  
     - Meaningful naming conventions  
     - Reduced cognitive complexity (<15 per method)  
     - No code duplication  
     - Single responsibility per component  
     
   - [ ] Clean Architecture Validation  
     - Dependency rule compliance  
     - Layer isolation verification  
     - Framework independence check  
     - Business logic purity  

   - [ ] SOLID Principles Audit  
     - Single Responsibility (no multi-purpose classes)  
     - Open/Closed compliance  
     - Liskov Substitution verification  
     - Interface Segregation check  
     - Dependency Inversion validation  

   - [ ] Best Practices Enforcement  
     - Secure coding patterns  
     - Performance optimizations  
     - Error handling completeness  
     - Logging standards  

2. **Documentation Compliance**  
   - [ ] ADR (Architectural Decision Records)  
     - Verify implementation matches approved ADRs  
     - Check for undocumented architectural changes  

   - [ ] SDR (Software Design Records)  
     - Validate alignment with system design specs  
     - Confirm component interaction patterns  

   - [ ] GDR (Guideline Decision Records)  
     - Ensure team coding standards adherence  
     - Verify toolchain configuration compliance  


## Review Report for `result` in `attempt_completion`:
- Report in [REQUIRED_FIXES] what needs to be fixed, why it needs to be fixed and how it needs to be fixed to pass your audit. Include the files, functions, lines or any other relevant information.
- ONLY APPROVE if it has passed all checks with success.
```
## Validation Results
1. [✓/✗] Clean Code compliance
2. [✓/✗] SOLID compliance
3. [✓/✗] Clean Architecture rules
4. [✓/✗] Best Practices

### Documentation Compliance
5. [✓/✗] ADRs compliance
6. [✓/✗] SDRs compliance
7. [✓/✗] GDRs compliance

## Approval Status
APPROVED | REJECTED: [REQUIRED_FIXES]
```