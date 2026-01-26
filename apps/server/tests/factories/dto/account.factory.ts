import { faker } from '@faker-js/faker'
import { CreateAccountDTO } from 'apps/server/src/account/DTO/account.dto'

export function buildCreateAccountDTO(
  overrides: Partial<CreateAccountDTO> = {},
): CreateAccountDTO {
  return {
    userId: faker.string.alphanumeric(12),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 16 }),
    name: faker.person.fullName(),
    ...overrides,
  }
}
