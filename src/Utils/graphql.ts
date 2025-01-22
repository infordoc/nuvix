import { PageInfo } from "src/base/objects/base.object";


export class GqlResolver<T> {
  constructor(
    private readonly repo: Repository<T>,
  ) { }

  async resolveEdge() {
    let data = await this.repo.findAndCount({
      take: 10,
      skip: 0,
    });

    return {
      nodes: data[0],
      pageInfo: {
        page: 1,
        pageSize: 10,
        pageCount: Math.ceil(data[1] / 10),
        total: data[1],
      }
    };
  }

  async resolveQuery(name: string, args: any) {
    const page = args?.pagination?.page || 1;
    const pageSize = args?.pagination?.pageSize || 10;

    const queryBuilder = this.repo.createQueryBuilder(name);
    let query = await buildQuery(queryBuilder, args).getManyAndCount();

    return {
      nodes: query[0],
      pageInfo: {
        total: query[1],
        pageCount: Math.ceil(query[1] / pageSize),
        page: page,
        pageSize: pageSize,
      } as PageInfo
    };
  }

}