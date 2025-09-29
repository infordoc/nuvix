import { MetricPeriod } from '@nuvix/utils'

const usageConfig = {
  '24h': {
    period: MetricPeriod.HOUR,
    limit: 24,
    factor: 3600,
  },
  '7d': {
    period: MetricPeriod.DAY,
    limit: 7,
    factor: 86400,
  },
  '30d': {
    period: MetricPeriod.DAY,
    limit: 30,
    factor: 86400,
  },
  '90d': {
    period: MetricPeriod.DAY,
    limit: 90,
    factor: 86400,
  },
}

export default usageConfig
