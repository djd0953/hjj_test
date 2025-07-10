import { dummy } from "@/libs/mock_data/organization";
import type { TeamOrganization } from "types";

const getOrganizationTree = (organizationList: TeamOrganization[]): TeamOrganization[] => 
{
    const iMap: Map<string, TeamOrganization> = new Map()
    for (const o of organizationList)
    {
        o.source_original_data = JSON.stringify(o)
        o.children = []

        iMap.set(o.id, o)
    }

    const tree: TeamOrganization[] = []
    for (const o of organizationList)
    {
        if (o.ancestor_id) 
        {
            const parent = iMap.get(o.ancestor_id)
            if (parent)
                parent.children?.push(o)
            else
                tree.push(o)
        }
        else
            tree.push(o)
    }

    const getDepth = (o: TeamOrganization, depth: number) => 
    {
        o.depth = depth;

        if (Array.isArray(o.children) && o.children.length > 0) 
        {
            for (const c of o.children)
                getDepth(c, depth + 1)
        }
    }

    for (const o of tree)
        getDepth(o, 0)

    
    return tree
}

const getOrganization = (tree: TeamOrganization[], id: string): TeamOrganization | null => 
{
    let ft: TeamOrganization | null = null

    const findOrg = (t: TeamOrganization) =>
    {
        if (ft) return
        else if (t.id === id)
        {
            ft = t
            return
        }
        else if (t.children && t.children.length > 0)
            for (const c of t.children)
                findOrg(c)
    }

    for (const o of tree)
        findOrg(o)

    return ft
}

const run = async () => {
    const a = getOrganizationTree(dummy)
    const b = getOrganization(a, '01BH131460')

    console.log(1)
}

export default run
// 다이닝 활성 인원 150 -> 9999 (294)