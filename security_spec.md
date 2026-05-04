# Firestore Security Specification

## Data Invariants
1. **Admissions**: 
   - Application ID must be valid.
   - `paid` must be true and immutable after creation if set to true.
   - `testScore` must be within 0-100.
   - Users can only create applications. Reading/Updating is restricted to Admins.
   
2. **Results**:
   - `studentId` must be provided and valid.
   - `subjects` must be a list of objects with name, score, and grade.
   - Only Admins can write results. Anyone with the valid Student ID can read their own results.

3. **Students**:
   - Only Admins can manage the student registry.
   - Students can be read by anyone (to verify IDs during registration/result check, but we should restrict this to listing if needed, actually the app does `getDocs` on `students` in some places).
   
4. **Admins**:
   - Restricted to a set of pre-defined emails.
   - Only current admins can create other admins (or the first one is bootstrapped).

## The Dirty Dozen (Vulnerability Scenarios)
1. **Identity Spoofing**: Attacker tries to update an admission status to 'accepted' by pretending to be an admin.
2. **Resource Poisoning**: Attacker creates an admission document with a 1MB string as name.
3. **Price Manipulation**: Attacker submits an admission application with `paid: false` but bypasses client checks.
4. **Data Injection**: Attacker injects a `role: superadmin` field into their own user profile (if we had user profiles).
5. **Orphaned Results**: Attacker creates a result for a non-existent student ID.
6. **Relational Break**: Attacker deletes a student while keeping their results.
7. **Bypassing Payment**: Attacker updates an existing pending admission to `paid: true` without a valid reference.
8. **Bulk Query Scraping**: Attacker tries to list all results without providing a student ID filter.
9. **Timestamp Spoofing**: Attacker sets `createdAt` to a future date to stay at the top of lists.
10. **ID Poisoning**: Attacker uses a massive unique ID string to exhaust storage costs.
11. **Shadow Update**: Attacker adds a `verified: true` field to an admission that isn't in the schema.
12. **Unauthorized Admin Elevation**: Attacker creates a document in the `admins` collection with their UID.

## Test Runner (Draft Plan)
A test suite will be implemented in `firestore.rules.test.ts` (using `@firebase/rules-unit-testing`) to verify these constraints.
