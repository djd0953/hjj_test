package hjj.type.dto

interface Organization {
    val id: String
    val ancestor_id: String?
    val source_original_data: String?
    val children: List<Organization>?
    val parent: List<Organization>?
    val depth: Int?
}