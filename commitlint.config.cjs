module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting
        "refactor", // Code refactoring
        "perf", // Performance
        "test", // Tests
        "chore", // Maintenance
        "revert", // Revert
        "build", // Build system
        "ci", // CI/CD
      ],
    ],
    "subject-case": [0], // Allow any case
  },
};
