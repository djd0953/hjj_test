SELECT
    *
FROM
    `users` AS `users`
WHERE
    `users`.`sso_id` = '176450'
    AND `users`.`sso_source` = 'dining_brands'
    AND `users`.`status` = 1
LIMIT
    1