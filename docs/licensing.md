# Licensing guidance

Maplyo Core is distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0-only)**. To keep provenance clear, new source files should include an SPDX license identifier whenever possible.

## Adding SPDX headers
1. Place the identifier at the very top of the file, before any code.
2. Match the comment style of the language you are using.
3. Use the exact string `SPDX-License-Identifier: AGPL-3.0-only`.

### Examples
- JavaScript / TypeScript / Vue:
  ```js
  // SPDX-License-Identifier: AGPL-3.0-only
  ```
- CSS / SCSS:
  ```css
  /* SPDX-License-Identifier: AGPL-3.0-only */
  ```
- SQL:
  ```sql
  -- SPDX-License-Identifier: AGPL-3.0-only
  ```
- Shell / batch scripts:
  ```sh
  # SPDX-License-Identifier: AGPL-3.0-only
  ```

SPDX headers are recommended for all newly created files. Existing files may be updated incrementally when you are already touching them for functional changes; a sweeping reformat is not required.

## License references in documentation
When referencing the license in docs, prefer “AGPL-3.0-only” and link to the repository’s [LICENSE](../LICENSE) file so readers can review the full text.
