import { ClusterManagerClient } from "@google-cloud/container";
import { Logger } from "@nestjs/common";
import { KubeConfig, KubernetesObjectApi } from "@kubernetes/client-node";

export class ClusterService {
    private readonly logger = new Logger(ClusterService.name)
    constructor() { }

    async getCluster() {
        const client = new ClusterManagerClient()
        client.auth.fromAPIKey()
        const list = await client.getCluster({ name: 'projects/uplifted-matrix-459802-d9/locations/us-central1-c/clusters/nuvix' })
        return list[0]
    }

    async createKubeClient(cluster: any) {
        const kubeconfig = new KubeConfig();
        const clusterConfig = {
            name: cluster.name,
            server: cluster.endpoint,
            cluster: {
                "server": cluster.endpoint,
                "insecure-skip-tls-verify": "true"
            },
            "user": {
                "name": "gke",
                // "token": cluster.master_authorized_networks_config.cidr_blocks[0],
            },
            "context": {
                "name": "gke",
                "cluster": "gke",
                "user": "gke"
            },
        };

        kubeconfig.addCluster(clusterConfig);
        // kubeconfig.setContext(clusterConfig.context.name);
        // kubeconfig.setAuth(clusterConfig.user);

        return kubeconfig;
    }

}



// TEMP TEST

const c = new ClusterService()

let cluster = c.getCluster()

// const client = await c.createKubeClient(cluster)

// let d = new KubernetesObjectApi(client)

// Logger.log(client)