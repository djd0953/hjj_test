export interface TeamOrganization {
    id: string,
    team_id: number,
    name: string,
    sort_id: number,
    ancestor_id: string | null
    depth?: number
    source_original_data?: string
    children?: TeamOrganization[]
}