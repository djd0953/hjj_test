SELECT
    `clm_log`.*
FROM
    (
        SELECT
            `clm_log`.`id`,
            `clm_log`.`clm_id`,
            `clm_log`.`team_id`,
            `clm_log`.`user_id`,
            `clm_log`.`type`,
            `clm_log`.`content`,
            `clm_log`.`clm_progress_status`,
            `clm_log`.`team_category_id`,
            `clm_log`.`team_subcategory_id`,
            `clm_log`.`is_only_team_visible`,
            `clm_log`.`updated_at`,
            `clm_log`.`created_at`,
            `clm_log`.`is_del`
        FROM
            `clm_log` AS `clm_log`
        WHERE
            (
                `clm_log`.`type` IN (2, 3, 4)
                OR (
                    (
                        `clm_log`.`is_only_team_visible` = 1
                        OR (
                            `clm_log`.`is_only_team_visible` = 2
                            AND `clm_log`.`team_subcategory_id` = 11628
                        )
                    )
                    AND `clm_log`.`type` = 1
                )
            )
            AND `clm_log`.`is_del` = 1
            AND `clm_log`.`clm_id` = '124859'
        ORDER BY
            `clm_log`.`id` DESC
        LIMIT
            0, 50
    ) AS `clm_log`
    LEFT OUTER JOIN `users` AS `user` ON `clm_log`.`user_id` = `user`.`id`
    LEFT OUTER JOIN `clm_log_attachment` AS `clm_log_attachments` ON `clm_log`.`id` = `clm_log_attachments`.`clm_log_id`
    AND `clm_log_attachments`.`is_del` = 1
ORDER BY
    `clm_log`.`id` DESC;