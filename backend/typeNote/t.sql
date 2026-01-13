SELECT
    *
FROM
    `user_permission` AS `user_permission`
    INNER JOIN `permission` AS `permission` ON `user_permission`.`permission_id` = `permission`.`id`
    LEFT OUTER JOIN `permission_category` AS `permission->permission_category` ON `permission`.`permission_category_id` = `permission->permission_category`.`id`
    LEFT OUTER JOIN `permission` AS `cloud_document_following` ON user_permission.cloud_document_id = cloud_document_following.id
WHERE
    `user_permission`.`is_del` = 1
    AND `user_permission`.`user_id` = 74671
    AND `user_permission`.`start_date` <= '2025-10-24 11:18:06'
    AND `user_permission`.`end_date` >= '2025-10-24 11:18:06'
ORDER BY
    `user_permission`.`id` ASC
LIMIT
    0, 500;