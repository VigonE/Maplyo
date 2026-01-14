# Contributing to Maplyo
Thanks for helping improve Maplyo Core! This guide explains how to propose changes, run checks, and make sure contributions align with the AGPL-3.0-only license.

## Contribution workflow
1. **Fork** the repository to your own GitHub account.
2. **Create a branch** from `main` with a descriptive name (example: `feature/improve-geo-filter`).
3. **Make focused commits** that keep changes scoped and easy to review.
4. **Run the checks** listed below before submitting your pull request.
5. **Open a PR** back to `main`, filling out the pull-request template and requesting review.
6. **Iterate quickly** on feedback; force-pushes are fine as long as history remains clear.

## Code style and standards
- Follow existing patterns within each directory (Vue components, stores, Express routes, SQL migrations, etc.).
- Prefer readable, well-tested code over cleverness; add succinct comments only where behavior might surprise newcomers.
- Keep dependencies lean and document any new external service that becomes required at runtime.
- Linting/formatting is handled by the project’s existing tooling (Vite, ESLint, Prettier, etc.); run those scripts locally when available.

## Tests and verification
Automated test coverage is still evolving. Until a full suite is published:
- TODO: Document authoritative test commands for both frontend and backend packages.
- TODO: Add seed data fixtures for deterministic E2E checks.
- At minimum, manually verify that `npm run server:dev` and `npm run dev` still start cleanly and that critical user flows (login, prospect CRUD, map rendering) behave as expected.

## Documentation expectations
- Update README or relevant docs for any user-facing change.
- Include migration notes when altering database schemas.
- Reference `docs/licensing.md` if you add new source files that should carry SPDX headers.

## Licensing of contributions
By submitting a contribution, you agree that:
- Your work is licensed under the same terms as the project, namely **AGPL-3.0-only**.
- You have the legal right to contribute the code and assets you submit.

## Developer Certificate of Origin (DCO)
Maplyo uses a lightweight DCO instead of a CLA. Each commit must be signed off using `git commit -s`, which adds the following line to your commit message:

```
Signed-off-by: Your Name <email@example.com>
```

Signing off certifies that you wrote the contribution or have the right to pass it on under the project’s license. Commits without a valid sign-off cannot be merged.

## Communication channels
- **Issues**: Bug reports, feature proposals, and clarifying questions
- **Discussions**: Roadmap ideas, architectural debates, and community support threads

Thanks again for contributing to Maplyo Core!
