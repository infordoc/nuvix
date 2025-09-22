# Nuvix

> ⚠️ **Warning**: Nuvix is currently in active development and **not production-ready**. Breaking changes should be expected until the first stable release.

---

Nuvix is a high-performance backend platform built for modern applications—**fast, scalable, and developer-first**.  
It provides a complete backend-as-a-service (BaaS) experience with authentication, databases, storage, messaging, and more—all powered by PostgreSQL and Bun.

## Features

- **Flexible Schema System** – Nuvix offers three types of schemas for different use cases:

  * **Document Schema** – Similar to Appwrite’s database, designed for rapid development. Unlike Appwrite, Nuvix supports **relationship-based filtering**, letting you query top-level documents based on related document attributes. Perfect for fast iteration and prototyping.

  * **Managed Schema** – Unique to Nuvix. When a user creates a table, Nuvix automatically provisions an additional `_perms` table with **Row-Level Security (RLS)** policies. This gives developers fine-grained control over security and customization **without the usual complexity**.

  * **Unmanaged Schema** – A raw PostgreSQL schema, similar to what Supabase provides. This is for developers who want **maximum freedom**, direct SQL access, and advanced PostgreSQL features.

- **Custom API Layer** – Unlike PostgREST, Nuvix provides a flexible API layer that allows:

  * Embedding related table data even without foreign keys.
  * Deep filtering across relationships.
  * Complex queries without relying solely on SQL.

- **Authentication & Authorization** – User management, roles, and fine-grained permission controls.
- **Messaging** – Built-in support for email, SMS, and push notifications.
- **Storage** – File uploads with chunked uploads and S3/local adapters.
- **Extensible Design** – Modular architecture built with TypeScript and NestJS.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.2.22
- [Redis](https://redis.io/) (for caching, queues, and events)
- [Docker](https://www.docker.com/)

### Installation

Clone the repository:

```bash
git clone https://github.com/Nuvix-Tech/nuvix.git
cd nuvix
````

Install dependencies:

```bash
bun install
```

### Running with Docker

Nuvix provides a `docker-compose.yml` for local development:

```bash
docker compose up --build
```

This will start:

* PostgreSQL
* Redis
* Nuvix server


## Roadmap

* [x] Authentication & authorization
* [x] Flexible schema system
* [x] Messaging (email, SMS, push)
* [x] Storage system
* [x] Admin dashboard 
* [ ] Fix bugs & write tests
* [ ] Real-time subscriptions
* [ ] First production-ready release

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the **Business Source License 1.1 (BSL)**.
See [LICENSE](LICENSE) for details.

## Acknowledgements

Nuvix is inspired by the work of projects like [Supabase](https://supabase.com), [Appwrite](https://appwrite.io), and [Firebase](https://firebase.google.com).
We aim to combine the best ideas from these ecosystems while introducing unique features such as our **flexible schema system**.
