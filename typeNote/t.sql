SELECT
    count(DISTINCT (`business_email_message`.`id`)) AS `count`
FROM
    `business_email_message` AS `business_email_message`
    LEFT OUTER JOIN `clm_log` AS `clm_log` ON `business_email_message`.`clm_log_id` = `clm_log`.`id`
    AND (
        (
            0 = 1
            AND `clm_log`.`type` = 1
        )
        OR (
            `clm_log`.`type` = 1
            AND `clm_log`.`is_only_team_visible` = 1
        )
        OR (
            `clm_log`.`type` = 1
            AND `clm_log`.`is_only_team_visible` = 2
            AND `clm_log`.`team_subcategory_id` = 11778
        )
        OR `clm_log`.`type` = 2
        OR `clm_log`.`type` = 3
        OR (
            `clm_log`.`type` = 4
            AND (
                SELECT
                    bem.is_system_mail
                FROM
                    business_email_message AS bem
                WHERE
                    bem.advice_log_id = advice_log.id
                ORDER BY
                    bem.id DESC
                LIMIT
                    1
            ) = 1
        )
    )
    AND `clm_log`.`is_del` = 1
    LEFT OUTER JOIN `advice_log` AS `advice_log` ON `business_email_message`.`advice_log_id` = `advice_log`.`id`
    AND (
        (
            0 = 1
            AND `advice_log`.`type` = 1
        )
        OR (
            `advice_log`.`type` = 1
            AND `advice_log`.`is_only_team_visible` = 1
        )
        OR (
            `advice_log`.`type` = 1
            AND `advice_log`.`is_only_team_visible` = 2
            AND `advice_log`.`team_subcategory_id` = 11778
        )
        OR `advice_log`.`type` = 2
        OR `advice_log`.`type` = 3
        OR (
            `advice_log`.`type` = 4
            AND (
                SELECT
                    bem.is_system_mail
                FROM
                    business_email_message AS bem
                WHERE
                    bem.advice_log_id = advice_log.id
                ORDER BY
                    bem.id DESC
                LIMIT
                    1
            ) = 1
        )
    )
    AND `advice_log`.`is_del` = 1
    LEFT OUTER JOIN `litigation_log` AS `litigation_log` ON `business_email_message`.`litigation_log_id` = `litigation_log`.`id`
    AND (
        (
            0 = 1
            AND `litigation_log`.`type` = 1
        )
        OR (
            `litigation_log`.`type` = 1
            AND `litigation_log`.`is_only_team_visible` = 1
        )
        OR (
            `litigation_log`.`type` = 1
            AND `litigation_log`.`is_only_team_visible` = 2
            AND `litigation_log`.`team_subcategory_id` = 11778
        )
        OR `litigation_log`.`type` = 2
        OR `litigation_log`.`type` = 3
        OR (
            `litigation_log`.`type` = 4
            AND (
                SELECT
                    bem.is_system_mail
                FROM
                    business_email_message AS bem
                WHERE
                    bem.advice_log_id = advice_log.id
                ORDER BY
                    bem.id DESC
                LIMIT
                    1
            ) = 1
        )
    )
    AND `litigation_log`.`is_del` = 1
    LEFT OUTER JOIN `business_email_recipient` AS `business_email_recipient` ON `business_email_message`.`id` = `business_email_recipient`.`business_email_message_id`
    LEFT OUTER JOIN `users` AS `business_email_recipient->user` ON `business_email_recipient`.`user_id` = `business_email_recipient->user`.`id`
    LEFT OUTER JOIN `team` AS `business_email_recipient->team` ON `business_email_recipient`.`team_id` = `business_email_recipient->team`.`id`
WHERE
    `business_email_message`.`is_del` = 1
    AND `business_email_message`.`advice_log_id` = '6049';