## AI-Assisted Development

### Tools Used

I used **Cursor AI** (powered by Claude) extensively throughout this project. The assessment explicitly encourages AI use, and I want to be transparent about how I used it.

### How I Used AI

**Code Generation**: AI generated most of the initial code based on my requirements. However, I:

- Provided clear specifications and requirements
- Reviewed all generated code for correctness
- Refactored and improved AI suggestions
- Fixed bugs that AI-generated code introduced

**Problem Solving**: When I encountered issues, I:

- Identified the problem (e.g., N+1 queries causing slow renders)
- Asked AI for potential solutions
- Evaluated multiple approaches
- Chose the best solution and implemented it
- Tested and verified the fix

**Architecture Decisions**: All major decisions were mine:

- Chose Next.js 16 with App Router
- Designed normalized database schema
- Decided on component architecture (server vs client components)
- Made UX decisions (inline editing, hover actions, combobox pattern)
- Chose caching strategy (no cache on list, 30s on detail pages)

### What This Demonstrates

This project shows my ability to:

- **Work with modern development tools** - AI is part of the ecosystem
- **Make technical decisions** - I chose the architecture and patterns
- **Solve problems systematically** - I identified issues and directed solutions
- **Understand code** - I reviewed, modified, and can explain everything
- **Think about trade-offs** - I made decisions about performance, UX, and code quality

### What This Project Demonstrates

This project showcases my technical skills and problem-solving approach:

**Architecture & Design**

- Designed a normalized database schema with proper relationships and constraints
- Made informed decisions about component architecture (server vs client components)
- Implemented efficient data fetching patterns to avoid N+1 query problems
- Chose appropriate caching strategies for optimal performance

**Problem Solving**

- Identified performance bottlenecks (800ms+ render times) and optimized queries
- Recognized code duplication and refactored into reusable components
- Solved complex UX challenges (combobox pattern, inline editing, hover states)
- Debugged and fixed issues in AI-generated code

**Code Quality**

- Conducted comprehensive code reviews and removed unused dependencies
- Organized components into logical folder structure
- Improved type safety throughout the application
- Replaced native browser APIs with custom components for better UX
