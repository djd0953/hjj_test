// TODO: dummy, TeamOrganization import 경로 확인 필요
// import { dummy } from "@libs/mock_data/organization";

interface TeamOrganization {
    id: string;
    ancestor_id?: string;
    source_original_data?: string;
    children?: TeamOrganization[];
    parent?: TeamOrganization;
    depth?: number;
}

const getOrganizationTree = (
    organizationList: TeamOrganization[]
): { tree: TeamOrganization[]; iMap: Map<string, TeamOrganization> } => {
    const iMap: Map<string, TeamOrganization> = new Map();
    for (const o of organizationList) {
        o.source_original_data = JSON.stringify(o);
        o.children = [];
        iMap.set(o.id, o);
    }

    const tree: TeamOrganization[] = [];
    for (const o of organizationList) {
        if (o.ancestor_id) {
            const parent = iMap.get(o.ancestor_id);
            if (parent) {
                o.parent = parent;
                parent.children?.push(o);
            } else tree.push(o);
        } else tree.push(o);
    }

    const getDepth = (o: TeamOrganization, depth: number) => {
        o.depth = depth;
        if (Array.isArray(o.children) && o.children.length > 0) {
            for (const c of o.children) getDepth(c, depth + 1);
        }
    };

    for (const o of tree) getDepth(o, 0);

    return { tree, iMap };
};

type SearchResult = {
    node: TeamOrganization;
    ancestors: TeamOrganization[];
};

const getOrganization = (tree: TeamOrganization[], id: string): SearchResult | null => {
    let result: SearchResult | null = null;

    const dfs = (current: TeamOrganization, path: TeamOrganization[]) => {
        if (result) return;
        if (current.id === id) {
            result = { node: current, ancestors: [...path] };
        }
        if (current.children && current.children.length > 0) {
            for (const child of current.children) dfs(child, [...path, current]);
        }
    };

    for (const rootNode of tree) {
        dfs(rootNode, []);
        if (result) break;
    }

    return result;
};

function findNodeAndAncestorsByIdMap(idMap: Map<string, TeamOrganization>, id: string) {
    const node = idMap.get(id);
    if (!node) return null;

    const ancestors: TeamOrganization[] = [];
    let current = node.parent;
    while (current) {
        ancestors.push(current);
        current = current.parent;
    }

    function collectDescendants(n: TeamOrganization): TeamOrganization[] {
        let desc: TeamOrganization[] = [];
        for (const child of n.children ?? []) {
            desc.push(child);
            desc = desc.concat(collectDescendants(child));
        }
        return desc;
    }
    const descendants = collectDescendants(node);

    return { node, ancestors, descendants };
}

export const organization = () => {
    return null;
};
