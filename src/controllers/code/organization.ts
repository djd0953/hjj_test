import { dummy } from "@libs/mock_data/organization";
import type { TeamOrganization } from "@types";

const getOrganizationTree = (organizationList: TeamOrganization[]): {tree: TeamOrganization[], iMap: Map<string, TeamOrganization>} => 
{
    const iMap: Map<string, TeamOrganization> = new Map();
    for (const o of organizationList)
    {
        o.source_original_data = JSON.stringify(o);
        o.children = [];

        iMap.set(o.id, o);
    }

    const tree: TeamOrganization[] = [];
    for (const o of organizationList)
    {
        if (o.ancestor_id) 
        {
            const parent = iMap.get(o.ancestor_id);
            if (parent) 
            {
                o.parent = parent;
                parent.children?.push(o);
            }
            else
                tree.push(o);
        }
        else
            tree.push(o);
    }

    const getDepth = (o: TeamOrganization, depth: number) => 
    {
        o.depth = depth;

        if (Array.isArray(o.children) && o.children.length > 0) 
        {
            for (const c of o.children)
                getDepth(c, depth + 1);
        }
    };

    for (const o of tree)
        getDepth(o, 0);

    
    return { tree, iMap };
};

type SeachResult = {
    node: TeamOrganization,
    ancestors: TeamOrganization[]
}
const getOrganization = (tree: TeamOrganization[], id: string): TeamOrganization | null => 
{
    let result: SeachResult | null = null;

    const dfs = (current: TeamOrganization, path: TeamOrganization[]) =>
    {
        if (result) return;
        if (current.id === id)
        {
            result = 
            {
                node: current,
                ancestors: [...path]
            };
        }

        if (current.children && current.children.length > 0)
        {
            for (const child of current.children)
                dfs(child, [...path, current]);
        }
    };

    for (const rootNode of tree)
    {
        dfs(rootNode, []);
        if (result) break;
    }

    return result;
};

function findNodeAndAncestorsByIdMap(idMap: Map<string, TeamOrganization>, id: string) 
{
    const node = idMap.get(id);
    if (!node) return null;

    const ancestors: TeamOrganization[] = [];
    let current = node.parent;
    while (current) 
    {
        ancestors.push(current);
        current = current.parent;
    }

    function collectDescendants(n: TeamOrganization): TeamOrganization[] 
    {
        let desc: TeamOrganization[] = [];
        for (const child of n.children ?? []) 
        {
            desc.push(child);
            desc = desc.concat(collectDescendants(child));
        }
        return desc;
    }
    const descendants = collectDescendants(node);

    return {
        node,
        ancestors, // 역순: 바로 위 부모부터 루트까지
        descendants
    };
}

const run = async () => 
{
    // console.time("getOrganizationTree");
    // const {tree, iMap} = getOrganizationTree(dummy);
    // console.timeEnd("getOrganizationTree")

    // console.time("getOrganization");
    // const b = getOrganization(tree, '01BH131460')
    // console.timeEnd("getOrganization")

    // console.time("findNodeAndAncestorsByIdMap");
    // const c = findNodeAndAncestorsByIdMap(iMap, '01BH131460')
    // console.timeEnd("findNodeAndAncestorsByIdMap")

    console.log(1);
};

export default run;
// 다이닝 활성 인원 150 -> 9999 (294)