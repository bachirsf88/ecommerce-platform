# BACKEND_CONTEXT

This backend is part of an academic web-based e-commerce platform for home-based women sellers.

## Stack
- Laravel
- MongoDB
- REST API
- Laravel Sanctum for token authentication

## Main Roles
- buyer
- seller
- admin

## Seller Status
- pending
- approved
- rejected

## Current Scope
Current focus is only:
- backend folder structure
- authentication
- role-based middleware
- current authenticated user endpoint
- user model preparation

## Business Rules
- Users can register and log in
- Users have roles: buyer, seller, admin
- Seller accounts may require approval using seller_status
- Protected routes must require authentication
- Some routes must be restricted by role
- API responses should be consistent JSON
- Controllers should stay thin
- Business logic should be inside services
- Validation should use Form Requests
- Middleware should handle auth and roles cleanly

## Architecture
Use this structure:
- Controllers
- Requests
- Services
- Repositories
- Models
- Middleware
- Traits

Flow:
Controller -> Service -> Repository -> Model

## Current Goal
Build the backend foundation for:
1. folder structure
2. user model preparation
3. auth endpoints:
   - register
   - login
   - logout
   - me
4. role middleware
5. basic API route organization

## Coding Style
- Keep code beginner-friendly
- Use clear naming
- Avoid overengineering
- Generate modular code
- Explain each generated file briefly
- Do not generate unrelated features yet
