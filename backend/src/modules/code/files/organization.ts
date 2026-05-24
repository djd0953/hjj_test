export type OrganizationItem = {
    id: string;
    team_id: number;
    name: string;
    sort_id: number;
    ancestor_id: string | null;
};

export const dummy: OrganizationItem[] = [
    {
        id: "01ZK000000",
        team_id: 999,
        name: "그룹",
        sort_id: 1,
        ancestor_id: null
    },
    {
        id: "DX00000250",
        team_id: 999,
        name: "COO",
        sort_id: 2,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK140100",
        team_id: 999,
        name: "프랜차이즈본부",
        sort_id: 3,
        ancestor_id: "DX00000250"
    },
    {
        id: "01ZK140110",
        team_id: 999,
        name: "프랜차이즈운영담당",
        sort_id: 17,
        ancestor_id: "01ZK140100"
    },
    {
        id: "01ZK140119",
        team_id: 999,
        name: "ABC운영1팀",
        sort_id: 1,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140148",
        team_id: 999,
        name: "ABC운영2팀",
        sort_id: 2,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140174",
        team_id: 999,
        name: "ABC운영3팀",
        sort_id: 3,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140105",
        team_id: 999,
        name: "ABC운영4팀",
        sort_id: 4,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140153",
        team_id: 999,
        name: "특수사업팀",
        sort_id: 5,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140107",
        team_id: 999,
        name: "A지역사업팀",
        sort_id: 7,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140108",
        team_id: 999,
        name: "B지역사업팀",
        sort_id: 8,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140111",
        team_id: 999,
        name: "C지역사업팀",
        sort_id: 9,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140115",
        team_id: 999,
        name: "D지역사업팀",
        sort_id: 10,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140106",
        team_id: 999,
        name: "E지역사업팀",
        sort_id: 11,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140114",
        team_id: 999,
        name: "F지역사업팀",
        sort_id: 12,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140165",
        team_id: 999,
        name: "왕할매운영팀",
        sort_id: 13,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140118",
        team_id: 999,
        name: "그릴그릴운영팀",
        sort_id: 14,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140192",
        team_id: 999,
        name: "ABC영업팀",
        sort_id: 15,
        ancestor_id: "01ZK140110"
    },
    {
        id: "01ZK140193",
        team_id: 999,
        name: "ABC가맹영업파트",
        sort_id: 1,
        ancestor_id: "01ZK140192"
    },
    {
        id: "01ZK140195",
        team_id: 999,
        name: "ABC직영영업파트",
        sort_id: 2,
        ancestor_id: "01ZK140192"
    },
    {
        id: "01ZK140164",
        team_id: 999,
        name: "왕할매영업팀",
        sort_id: 18,
        ancestor_id: "01ZK140110"
    },
    {
        id: "DX00000246",
        team_id: 999,
        name: "프랜차이즈기획/지원담당",
        sort_id: 24,
        ancestor_id: "01ZK140100"
    },
    {
        id: "DX00000247",
        team_id: 999,
        name: "프랜차이즈기획팀",
        sort_id: 1,
        ancestor_id: "DX00000246"
    },
    {
        id: "01ZK140101",
        team_id: 999,
        name: "프랜차이즈지원팀",
        sort_id: 4,
        ancestor_id: "DX00000246"
    },
    {
        id: "7240881",
        team_id: 999,
        name: "ABC 직영매장1",
        sort_id: 1,
        ancestor_id: "01ZK140101"
    },
    {
        id: "7320881",
        team_id: 999,
        name: "ABC 직영매장2",
        sort_id: 2,
        ancestor_id: "01ZK140101"
    },
    {
        id: "7321881",
        team_id: 999,
        name: "ABC 직영매장3",
        sort_id: 3,
        ancestor_id: "01ZK140101"
    },
    {
        id: "7323881",
        team_id: 999,
        name: "ABC 직영매장4",
        sort_id: 4,
        ancestor_id: "01ZK140101"
    },
    {
        id: "7241881",
        team_id: 999,
        name: "ABC 직영매장5",
        sort_id: 5,
        ancestor_id: "01ZK140101"
    },
    {
        id: "7322881",
        team_id: 999,
        name: "ABC 직영매장6",
        sort_id: 6,
        ancestor_id: "01ZK140101"
    },
    {
        id: "01ZK140102",
        team_id: 999,
        name: "프랜차이즈CS팀",
        sort_id: 5,
        ancestor_id: "DX00000246"
    },
    {
        id: "01ZK140501",
        team_id: 999,
        name: "프랜차이즈교육팀",
        sort_id: 6,
        ancestor_id: "DX00000246"
    },
    {
        id: "MHO008000",
        team_id: 999,
        name: "XYZ사업본부",
        sort_id: 7,
        ancestor_id: "DX00000250"
    },
    {
        id: "MHO008100",
        team_id: 999,
        name: "XYZ운영담당",
        sort_id: 1,
        ancestor_id: "MHO008000"
    },
    {
        id: "MHO008110",
        team_id: 999,
        name: "XYZ운영팀",
        sort_id: 1,
        ancestor_id: "MHO008100"
    },
    {
        id: "MOP035000",
        team_id: 999,
        name: "1지역",
        sort_id: 4,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF031000",
        team_id: 999,
        name: "지점031-FOH",
        sort_id: 1,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP031000",
        team_id: 999,
        name: "지점031-BOH",
        sort_id: 2,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF086000",
        team_id: 999,
        name: "지점086-FOH",
        sort_id: 3,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP086000",
        team_id: 999,
        name: "지점086-BOH",
        sort_id: 4,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF099000",
        team_id: 999,
        name: "지점099-FOH",
        sort_id: 5,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP099000",
        team_id: 999,
        name: "지점099-BOH",
        sort_id: 6,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF115000",
        team_id: 999,
        name: "지점115-FOH",
        sort_id: 7,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP115000",
        team_id: 999,
        name: "지점115-BOH",
        sort_id: 8,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF135000",
        team_id: 999,
        name: "지점135-FOH",
        sort_id: 9,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP135000",
        team_id: 999,
        name: "지점135-BOH",
        sort_id: 10,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF138000",
        team_id: 999,
        name: "지점138-FOH",
        sort_id: 11,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP138000",
        team_id: 999,
        name: "지점138-BOH",
        sort_id: 12,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF143000",
        team_id: 999,
        name: "지점143-FOH",
        sort_id: 13,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP143000",
        team_id: 999,
        name: "지점143-BOH",
        sort_id: 14,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF169000",
        team_id: 999,
        name: "지점169-FOH",
        sort_id: 15,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP169000",
        team_id: 999,
        name: "지점169-BOH",
        sort_id: 16,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF174000",
        team_id: 999,
        name: "지점174-FOH",
        sort_id: 17,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP174000",
        team_id: 999,
        name: "지점174-BOH",
        sort_id: 18,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF182000",
        team_id: 999,
        name: "지점182-FOH",
        sort_id: 19,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP182000",
        team_id: 999,
        name: "지점182-BOH",
        sort_id: 20,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF190000",
        team_id: 999,
        name: "지점190-FOH",
        sort_id: 21,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP190000",
        team_id: 999,
        name: "지점190-BOH",
        sort_id: 22,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF194000",
        team_id: 999,
        name: "지점194-FOH",
        sort_id: 23,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP194000",
        team_id: 999,
        name: "지점194-BOH",
        sort_id: 24,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF156000",
        team_id: 999,
        name: "지점156-FOH",
        sort_id: 25,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP156000",
        team_id: 999,
        name: "지점156-BOH",
        sort_id: 26,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSF207000",
        team_id: 999,
        name: "지점207-FOH",
        sort_id: 27,
        ancestor_id: "MOP035000"
    },
    {
        id: "MSP207000",
        team_id: 999,
        name: "지점207-BOH",
        sort_id: 28,
        ancestor_id: "MOP035000"
    },
    {
        id: "MOP036000",
        team_id: 999,
        name: "2지역",
        sort_id: 5,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF019000",
        team_id: 999,
        name: "지점019-FOH",
        sort_id: 1,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP019000",
        team_id: 999,
        name: "지점019-BOH",
        sort_id: 2,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF117000",
        team_id: 999,
        name: "지점117-FOH",
        sort_id: 3,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP117000",
        team_id: 999,
        name: "지점117-BOH",
        sort_id: 4,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF127000",
        team_id: 999,
        name: "지점127-FOH",
        sort_id: 5,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP127000",
        team_id: 999,
        name: "지점127-BOH",
        sort_id: 6,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF129000",
        team_id: 999,
        name: "지점129-FOH",
        sort_id: 7,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP129000",
        team_id: 999,
        name: "지점129-BOH",
        sort_id: 8,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF134000",
        team_id: 999,
        name: "지점134-FOH",
        sort_id: 9,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP134000",
        team_id: 999,
        name: "지점134-BOH",
        sort_id: 10,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF140000",
        team_id: 999,
        name: "지점140-FOH",
        sort_id: 11,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP140000",
        team_id: 999,
        name: "지점140-BOH",
        sort_id: 12,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF144000",
        team_id: 999,
        name: "지점144-FOH",
        sort_id: 13,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP144000",
        team_id: 999,
        name: "지점144-BOH",
        sort_id: 14,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF145000",
        team_id: 999,
        name: "지점145-FOH",
        sort_id: 15,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP145000",
        team_id: 999,
        name: "지점145-BOH",
        sort_id: 16,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF153000",
        team_id: 999,
        name: "지점153-FOH",
        sort_id: 17,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP153000",
        team_id: 999,
        name: "지점153-BOH",
        sort_id: 18,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF187000",
        team_id: 999,
        name: "지점187-FOH",
        sort_id: 21,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP187000",
        team_id: 999,
        name: "지점187-BOH",
        sort_id: 22,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF192000",
        team_id: 999,
        name: "지점192-FOH",
        sort_id: 23,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP192000",
        team_id: 999,
        name: "지점192-BOH",
        sort_id: 24,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF199000",
        team_id: 999,
        name: "지점199-FOH",
        sort_id: 25,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP199000",
        team_id: 999,
        name: "지점199-BOH",
        sort_id: 26,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF201000",
        team_id: 999,
        name: "지점201-FOH",
        sort_id: 27,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP201000",
        team_id: 999,
        name: "지점201-BOH",
        sort_id: 28,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF701000",
        team_id: 999,
        name: "지점701-FOH",
        sort_id: 29,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP701000",
        team_id: 999,
        name: "지점701-BOH",
        sort_id: 30,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSF702000",
        team_id: 999,
        name: "지점702-FOH",
        sort_id: 31,
        ancestor_id: "MOP036000"
    },
    {
        id: "MSP702000",
        team_id: 999,
        name: "지점702-BOH",
        sort_id: 32,
        ancestor_id: "MOP036000"
    },
    {
        id: "MOP037000",
        team_id: 999,
        name: "3지역",
        sort_id: 6,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF021000",
        team_id: 999,
        name: "지점021-FOH",
        sort_id: 1,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP021000",
        team_id: 999,
        name: "지점021-BOH",
        sort_id: 2,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF062000",
        team_id: 999,
        name: "지점062-FOH",
        sort_id: 3,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP062000",
        team_id: 999,
        name: "지점062-BOH",
        sort_id: 4,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF085000",
        team_id: 999,
        name: "지점085-FOH",
        sort_id: 5,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP085000",
        team_id: 999,
        name: "지점085-BOH",
        sort_id: 6,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF103000",
        team_id: 999,
        name: "지점103-FOH",
        sort_id: 7,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP103000",
        team_id: 999,
        name: "지점103-BOH",
        sort_id: 8,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF131000",
        team_id: 999,
        name: "지점131-FOH",
        sort_id: 9,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP131000",
        team_id: 999,
        name: "지점131-BOH",
        sort_id: 10,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF136000",
        team_id: 999,
        name: "지점136-FOH",
        sort_id: 11,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP136000",
        team_id: 999,
        name: "지점136-BOH",
        sort_id: 12,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF155000",
        team_id: 999,
        name: "지점155-FOH",
        sort_id: 13,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP155000",
        team_id: 999,
        name: "지점155-BOH",
        sort_id: 14,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF160000",
        team_id: 999,
        name: "지점160-FOH",
        sort_id: 15,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP160000",
        team_id: 999,
        name: "지점160-BOH",
        sort_id: 16,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF166000",
        team_id: 999,
        name: "지점166-FOH",
        sort_id: 17,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP166000",
        team_id: 999,
        name: "지점166-BOH",
        sort_id: 18,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF170000",
        team_id: 999,
        name: "지점170-FOH",
        sort_id: 19,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP170000",
        team_id: 999,
        name: "지점170-BOH",
        sort_id: 20,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF171000",
        team_id: 999,
        name: "지점171-FOH",
        sort_id: 21,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP171000",
        team_id: 999,
        name: "지점171-BOH",
        sort_id: 22,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF183000",
        team_id: 999,
        name: "지점183-FOH",
        sort_id: 23,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP183000",
        team_id: 999,
        name: "지점183-BOH",
        sort_id: 24,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF184000",
        team_id: 999,
        name: "지점184-FOH",
        sort_id: 25,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP184000",
        team_id: 999,
        name: "지점184-BOH",
        sort_id: 26,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF196000",
        team_id: 999,
        name: "지점196-FOH",
        sort_id: 27,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP196000",
        team_id: 999,
        name: "지점196-BOH",
        sort_id: 28,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF200000",
        team_id: 999,
        name: "지점200-FOH",
        sort_id: 29,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP200000",
        team_id: 999,
        name: "지점200-BOH",
        sort_id: 30,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSF204000",
        team_id: 999,
        name: "지점204-FOH",
        sort_id: 31,
        ancestor_id: "MOP037000"
    },
    {
        id: "MSP204000",
        team_id: 999,
        name: "지점204-BOH",
        sort_id: 32,
        ancestor_id: "MOP037000"
    },
    {
        id: "MOP038000",
        team_id: 999,
        name: "4지역",
        sort_id: 7,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF045000",
        team_id: 999,
        name: "지점045-FOH",
        sort_id: 1,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP045000",
        team_id: 999,
        name: "지점045-BOH",
        sort_id: 2,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF105000",
        team_id: 999,
        name: "지점105-FOH",
        sort_id: 3,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP105000",
        team_id: 999,
        name: "지점105-BOH",
        sort_id: 4,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF132000",
        team_id: 999,
        name: "지점132-FOH",
        sort_id: 5,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP132000",
        team_id: 999,
        name: "지점132-BOH",
        sort_id: 6,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF150000",
        team_id: 999,
        name: "지점150-FOH",
        sort_id: 7,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP150000",
        team_id: 999,
        name: "지점150-BOH",
        sort_id: 8,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF152000",
        team_id: 999,
        name: "지점152-FOH",
        sort_id: 9,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP152000",
        team_id: 999,
        name: "지점152-BOH",
        sort_id: 10,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF154000",
        team_id: 999,
        name: "지점154-FOH",
        sort_id: 11,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP154000",
        team_id: 999,
        name: "지점154-BOH",
        sort_id: 12,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF163000",
        team_id: 999,
        name: "지점163-FOH",
        sort_id: 13,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP163000",
        team_id: 999,
        name: "지점163-BOH",
        sort_id: 14,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF167000",
        team_id: 999,
        name: "지점167-FOH",
        sort_id: 15,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP167000",
        team_id: 999,
        name: "지점167-BOH",
        sort_id: 16,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF175000",
        team_id: 999,
        name: "지점175-FOH",
        sort_id: 17,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP175000",
        team_id: 999,
        name: "지점175-BOH",
        sort_id: 18,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF176000",
        team_id: 999,
        name: "지점176-FOH",
        sort_id: 19,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP176000",
        team_id: 999,
        name: "지점176-BOH",
        sort_id: 20,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF178000",
        team_id: 999,
        name: "지점178-FOH",
        sort_id: 21,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP178000",
        team_id: 999,
        name: "지점178-BOH",
        sort_id: 22,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF188000",
        team_id: 999,
        name: "지점188-FOH",
        sort_id: 23,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP188000",
        team_id: 999,
        name: "지점188-BOH",
        sort_id: 24,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF202000",
        team_id: 999,
        name: "지점202-FOH",
        sort_id: 25,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP202000",
        team_id: 999,
        name: "지점202-BOH",
        sort_id: 26,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF203000",
        team_id: 999,
        name: "지점203-FOH",
        sort_id: 27,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP203000",
        team_id: 999,
        name: "지점203-BOH",
        sort_id: 28,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSF747000",
        team_id: 999,
        name: "지점747-FOH",
        sort_id: 29,
        ancestor_id: "MOP038000"
    },
    {
        id: "MSP747000",
        team_id: 999,
        name: "지점747-BOH",
        sort_id: 30,
        ancestor_id: "MOP038000"
    },
    {
        id: "MOP039000",
        team_id: 999,
        name: "5지역",
        sort_id: 8,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF038000",
        team_id: 999,
        name: "지점038-FOH",
        sort_id: 1,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP038000",
        team_id: 999,
        name: "지점038-BOH",
        sort_id: 2,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF040000",
        team_id: 999,
        name: "지점040-FOH",
        sort_id: 3,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP040000",
        team_id: 999,
        name: "지점040-BOH",
        sort_id: 4,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF101000",
        team_id: 999,
        name: "지점101-FOH",
        sort_id: 5,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP101000",
        team_id: 999,
        name: "지점101-BOH",
        sort_id: 6,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF112000",
        team_id: 999,
        name: "지점112-FOH",
        sort_id: 7,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP112000",
        team_id: 999,
        name: "지점112-BOH",
        sort_id: 8,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF118000",
        team_id: 999,
        name: "지점118-FOH",
        sort_id: 9,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP118000",
        team_id: 999,
        name: "지점118-BOH",
        sort_id: 10,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF124000",
        team_id: 999,
        name: "지점124-FOH",
        sort_id: 11,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP124000",
        team_id: 999,
        name: "지점124-BOH",
        sort_id: 12,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF157000",
        team_id: 999,
        name: "지점157-FOH",
        sort_id: 13,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP157000",
        team_id: 999,
        name: "지점157-BOH",
        sort_id: 14,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF162000",
        team_id: 999,
        name: "지점162-FOH",
        sort_id: 15,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP162000",
        team_id: 999,
        name: "지점162-BOH",
        sort_id: 16,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF164000",
        team_id: 999,
        name: "지점164-FOH",
        sort_id: 17,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP164000",
        team_id: 999,
        name: "지점164-BOH",
        sort_id: 18,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF173000",
        team_id: 999,
        name: "지점173-FOH",
        sort_id: 19,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP173000",
        team_id: 999,
        name: "지점173-BOH",
        sort_id: 20,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF179000",
        team_id: 999,
        name: "지점179-FOH",
        sort_id: 21,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP179000",
        team_id: 999,
        name: "지점179-BOH",
        sort_id: 22,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF189000",
        team_id: 999,
        name: "지점189-FOH",
        sort_id: 23,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP189000",
        team_id: 999,
        name: "지점189-BOH",
        sort_id: 24,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF195000",
        team_id: 999,
        name: "지점195-FOH",
        sort_id: 25,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP195000",
        team_id: 999,
        name: "지점195-BOH",
        sort_id: 26,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSP197000",
        team_id: 999,
        name: "지점197-BOH",
        sort_id: 27,
        ancestor_id: "MOP039000"
    },
    {
        id: "MSF197000",
        team_id: 999,
        name: "지점197-FOH",
        sort_id: 28,
        ancestor_id: "MOP039000"
    },
    {
        id: "MOP060000",
        team_id: 999,
        name: "6지역",
        sort_id: 9,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF012000",
        team_id: 999,
        name: "지점012-FOH",
        sort_id: 1,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP012000",
        team_id: 999,
        name: "지점012-BOH",
        sort_id: 2,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF036000",
        team_id: 999,
        name: "지점036-FOH",
        sort_id: 3,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP036000",
        team_id: 999,
        name: "지점036-BOH",
        sort_id: 4,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF077000",
        team_id: 999,
        name: "지점077-FOH",
        sort_id: 5,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP077000",
        team_id: 999,
        name: "지점077-BOH",
        sort_id: 6,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF090000",
        team_id: 999,
        name: "지점090-FOH",
        sort_id: 7,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP090000",
        team_id: 999,
        name: "지점090-BOH",
        sort_id: 8,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF098000",
        team_id: 999,
        name: "지점098-FOH",
        sort_id: 9,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP098000",
        team_id: 999,
        name: "지점098-BOH",
        sort_id: 10,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF139000",
        team_id: 999,
        name: "지점139-FOH",
        sort_id: 13,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP139000",
        team_id: 999,
        name: "지점139-BOH",
        sort_id: 14,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF141000",
        team_id: 999,
        name: "지점141-FOH",
        sort_id: 15,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP141000",
        team_id: 999,
        name: "지점141-BOH",
        sort_id: 16,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF146000",
        team_id: 999,
        name: "지점146-FOH",
        sort_id: 17,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP146000",
        team_id: 999,
        name: "지점146-BOH",
        sort_id: 18,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF158000",
        team_id: 999,
        name: "지점158-FOH",
        sort_id: 19,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP158000",
        team_id: 999,
        name: "지점158-BOH",
        sort_id: 20,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF168000",
        team_id: 999,
        name: "지점168-FOH",
        sort_id: 21,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP168000",
        team_id: 999,
        name: "지점168-BOH",
        sort_id: 22,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF180000",
        team_id: 999,
        name: "지점180-FOH",
        sort_id: 23,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP180000",
        team_id: 999,
        name: "지점180-BOH",
        sort_id: 24,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSP205000",
        team_id: 999,
        name: "지점205-BOH",
        sort_id: 25,
        ancestor_id: "MOP060000"
    },
    {
        id: "MSF205000",
        team_id: 999,
        name: "지점205-FOH",
        sort_id: 26,
        ancestor_id: "MOP060000"
    },
    {
        id: "MOP070000",
        team_id: 999,
        name: "7지역",
        sort_id: 10,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF029000",
        team_id: 999,
        name: "지점029-FOH",
        sort_id: 1,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP029000",
        team_id: 999,
        name: "지점029-BOH",
        sort_id: 2,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF092000",
        team_id: 999,
        name: "지점092-FOH",
        sort_id: 3,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP092000",
        team_id: 999,
        name: "지점092-BOH",
        sort_id: 4,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF121000",
        team_id: 999,
        name: "지점121-FOH",
        sort_id: 5,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP121000",
        team_id: 999,
        name: "지점121-BOH",
        sort_id: 6,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF122000",
        team_id: 999,
        name: "지점122-FOH",
        sort_id: 7,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP122000",
        team_id: 999,
        name: "지점122-BOH",
        sort_id: 8,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF128000",
        team_id: 999,
        name: "지점128-FOH",
        sort_id: 9,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP128000",
        team_id: 999,
        name: "지점128-BOH",
        sort_id: 10,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF130000",
        team_id: 999,
        name: "지점130-FOH",
        sort_id: 11,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP130000",
        team_id: 999,
        name: "지점130-BOH",
        sort_id: 12,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF151000",
        team_id: 999,
        name: "지점151-FOH",
        sort_id: 13,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP151000",
        team_id: 999,
        name: "지점151-BOH",
        sort_id: 14,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF159000",
        team_id: 999,
        name: "지점159-FOH",
        sort_id: 15,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP159000",
        team_id: 999,
        name: "지점159-BOH",
        sort_id: 16,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF165000",
        team_id: 999,
        name: "지점165-FOH",
        sort_id: 17,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP165000",
        team_id: 999,
        name: "지점165-BOH",
        sort_id: 18,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF177000",
        team_id: 999,
        name: "지점177-FOH",
        sort_id: 19,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP177000",
        team_id: 999,
        name: "지점177-BOH",
        sort_id: 20,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF181000",
        team_id: 999,
        name: "지점181-FOH",
        sort_id: 21,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP181000",
        team_id: 999,
        name: "지점181-BOH",
        sort_id: 22,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF185000",
        team_id: 999,
        name: "지점185-FOH",
        sort_id: 23,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP185000",
        team_id: 999,
        name: "지점185-BOH",
        sort_id: 24,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSF198000",
        team_id: 999,
        name: "지점198-FOH",
        sort_id: 25,
        ancestor_id: "MOP070000"
    },
    {
        id: "MSP198000",
        team_id: 999,
        name: "지점198-BOH",
        sort_id: 26,
        ancestor_id: "MOP070000"
    },
    {
        id: "MOP080000",
        team_id: 999,
        name: "8지역",
        sort_id: 11,
        ancestor_id: "MHO008100"
    },
    {
        id: "MSF030000",
        team_id: 999,
        name: "지점030-FOH",
        sort_id: 1,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP030000",
        team_id: 999,
        name: "지점030-BOH",
        sort_id: 2,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF119000",
        team_id: 999,
        name: "지점119-FOH",
        sort_id: 3,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP119000",
        team_id: 999,
        name: "지점119-BOH",
        sort_id: 4,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF126000",
        team_id: 999,
        name: "지점126-FOH",
        sort_id: 5,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP126000",
        team_id: 999,
        name: "지점126-BOH",
        sort_id: 6,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF147000",
        team_id: 999,
        name: "지점147-FOH",
        sort_id: 7,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP147000",
        team_id: 999,
        name: "지점147-BOH",
        sort_id: 8,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF148000",
        team_id: 999,
        name: "지점148-FOH",
        sort_id: 9,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP148000",
        team_id: 999,
        name: "지점148-BOH",
        sort_id: 10,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF149000",
        team_id: 999,
        name: "지점149-FOH",
        sort_id: 11,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP149000",
        team_id: 999,
        name: "지점149-BOH",
        sort_id: 12,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF161000",
        team_id: 999,
        name: "지점161-FOH",
        sort_id: 13,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP161000",
        team_id: 999,
        name: "지점161-BOH",
        sort_id: 14,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF172000",
        team_id: 999,
        name: "지점172-FOH",
        sort_id: 15,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP172000",
        team_id: 999,
        name: "지점172-BOH",
        sort_id: 16,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF186000",
        team_id: 999,
        name: "지점186-FOH",
        sort_id: 17,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP186000",
        team_id: 999,
        name: "지점186-BOH",
        sort_id: 18,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF191000",
        team_id: 999,
        name: "지점191-FOH",
        sort_id: 19,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP191000",
        team_id: 999,
        name: "지점191-BOH",
        sort_id: 20,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF193000",
        team_id: 999,
        name: "지점193-FOH",
        sort_id: 21,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP193000",
        team_id: 999,
        name: "지점193-BOH",
        sort_id: 22,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSF125000",
        team_id: 999,
        name: "지점125-FOH",
        sort_id: 23,
        ancestor_id: "MOP080000"
    },
    {
        id: "MSP125000",
        team_id: 999,
        name: "지점125-BOH",
        sort_id: 24,
        ancestor_id: "MOP080000"
    },
    {
        id: "MHO008200",
        team_id: 999,
        name: "XYZ지원담당",
        sort_id: 2,
        ancestor_id: "MHO008000"
    },
    {
        id: "MHO017100",
        team_id: 999,
        name: "XYZ지원팀",
        sort_id: 3,
        ancestor_id: "MHO008200"
    },
    {
        id: "MHO201000",
        team_id: 999,
        name: "XYZ기획파트",
        sort_id: 4,
        ancestor_id: "MHO008200"
    },
    {
        id: "MHO204000",
        team_id: 999,
        name: "산업안전보건파트",
        sort_id: 5,
        ancestor_id: "MHO008200"
    },
    {
        id: "01ZK140162",
        team_id: 999,
        name: "부동산개발팀",
        sort_id: 23,
        ancestor_id: "DX00000250"
    },
    {
        id: "01ZK130000",
        team_id: 999,
        name: "CFO",
        sort_id: 6,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK181000",
        team_id: 999,
        name: "HR지원담당",
        sort_id: 7,
        ancestor_id: "01ZK130000"
    },
    {
        id: "01ZK130600",
        team_id: 999,
        name: "인사1팀",
        sort_id: 1,
        ancestor_id: "01ZK181000"
    },
    {
        id: "MHO014000",
        team_id: 999,
        name: "인사2팀",
        sort_id: 2,
        ancestor_id: "01ZK181000"
    },
    {
        id: "01ZK130620",
        team_id: 999,
        name: "총무팀",
        sort_id: 3,
        ancestor_id: "01ZK181000"
    },
    {
        id: "01ZK130630",
        team_id: 999,
        name: "인재육성팀",
        sort_id: 4,
        ancestor_id: "01ZK181000"
    },
    {
        id: "01ZK182000",
        team_id: 999,
        name: "재무담당",
        sort_id: 9,
        ancestor_id: "01ZK130000"
    },
    {
        id: "01ZK182010",
        team_id: 999,
        name: "경영관리팀",
        sort_id: 1,
        ancestor_id: "01ZK182000"
    },
    {
        id: "01ZK130710",
        team_id: 999,
        name: "재무관리1팀",
        sort_id: 2,
        ancestor_id: "01ZK182000"
    },
    {
        id: "MHO011000",
        team_id: 999,
        name: "재무관리2팀",
        sort_id: 3,
        ancestor_id: "01ZK182000"
    },
    {
        id: "01ZK130713",
        team_id: 999,
        name: "직영파트",
        sort_id: 1,
        ancestor_id: "MHO011000"
    },
    {
        id: "MHO011100",
        team_id: 999,
        name: "xyz파트",
        sort_id: 2,
        ancestor_id: "MHO011000"
    },
    {
        id: "01ZK183000",
        team_id: 999,
        name: "구매담당",
        sort_id: 10,
        ancestor_id: "01ZK130000"
    },
    {
        id: "01ZK130400",
        team_id: 999,
        name: "구매1팀",
        sort_id: 1,
        ancestor_id: "01ZK183000"
    },
    {
        id: "DX00000253",
        team_id: 999,
        name: "원재료구매파트",
        sort_id: 1,
        ancestor_id: "01ZK130400"
    },
    {
        id: "MHO012000",
        team_id: 999,
        name: "구매2팀",
        sort_id: 2,
        ancestor_id: "01ZK183000"
    },
    {
        id: "01ZK130450",
        team_id: 999,
        name: "구매3팀",
        sort_id: 3,
        ancestor_id: "01ZK183000"
    },
    {
        id: "01ZK132000",
        team_id: 999,
        name: "HMR파트",
        sort_id: 4,
        ancestor_id: "01ZK183000"
    },
    {
        id: "01ZK130800",
        team_id: 999,
        name: "경영기획팀",
        sort_id: 11,
        ancestor_id: "01ZK130000"
    },
    {
        id: "01ZK130810",
        team_id: 999,
        name: "Storage99해외사업본부",
        sort_id: 46,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK130815",
        team_id: 999,
        name: "해외사업팀",
        sort_id: 1,
        ancestor_id: "01ZK130810"
    },
    {
        id: "01ZK130816",
        team_id: 999,
        name: "해외영업/기획파트",
        sort_id: 1,
        ancestor_id: "01ZK130815"
    },
    {
        id: "01ZK130817",
        team_id: 999,
        name: "해외운영파트",
        sort_id: 2,
        ancestor_id: "01ZK130815"
    },
    {
        id: "01ZK130819",
        team_id: 999,
        name: "해외법인",
        sort_id: 3,
        ancestor_id: "01ZK130815"
    },
    {
        id: "01ZK130818",
        team_id: 999,
        name: "해외지사1",
        sort_id: 4,
        ancestor_id: "01ZK130815"
    },
    {
        id: "01ZK140191",
        team_id: 999,
        name: "Storage99운영팀",
        sort_id: 10,
        ancestor_id: "01ZK130810"
    },
    {
        id: "01ZK140182",
        team_id: 999,
        name: "Storage99운영파트",
        sort_id: 1,
        ancestor_id: "01ZK140191"
    },
    {
        id: "01ZK150100",
        team_id: 999,
        name: "Storage99매장",
        sort_id: 1,
        ancestor_id: "01ZK140182"
    },
    {
        id: "80509881",
        team_id: 999,
        name: "Storage99 매장A",
        sort_id: 2,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80109881",
        team_id: 999,
        name: "Storage99 매장B",
        sort_id: 3,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80209881",
        team_id: 999,
        name: "Storage99 매장C",
        sort_id: 5,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80409881",
        team_id: 999,
        name: "Storage99 매장D",
        sort_id: 6,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80609881",
        team_id: 999,
        name: "Storage99 매장E",
        sort_id: 7,
        ancestor_id: "01ZK150100"
    },
    {
        id: "806009881",
        team_id: 999,
        name: "Storage99 매장F",
        sort_id: 8,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80709881",
        team_id: 999,
        name: "Storage99 매장G",
        sort_id: 9,
        ancestor_id: "01ZK150100"
    },
    {
        id: "80909881",
        team_id: 999,
        name: "Storage99 매장H",
        sort_id: 10,
        ancestor_id: "01ZK150100"
    },
    {
        id: "81009881",
        team_id: 999,
        name: "Storage99 매장I",
        sort_id: 11,
        ancestor_id: "01ZK150100"
    },
    {
        id: "81109881",
        team_id: 999,
        name: "Storage99 매장J",
        sort_id: 12,
        ancestor_id: "01ZK150100"
    },
    {
        id: "81209881",
        team_id: 999,
        name: "Storage99 매장K",
        sort_id: 13,
        ancestor_id: "01ZK150100"
    },
    {
        id: "81309881",
        team_id: 999,
        name: "Storage99 매장L",
        sort_id: 14,
        ancestor_id: "01ZK150100"
    },
    {
        id: "81409881",
        team_id: 999,
        name: "Storage99 매장M",
        sort_id: 15,
        ancestor_id: "01ZK150100"
    },
    {
        id: "8160881",
        team_id: 999,
        name: "Storage99 매장N",
        sort_id: 17,
        ancestor_id: "01ZK150100"
    },
    {
        id: "8170881",
        team_id: 999,
        name: "Storage99 매장O",
        sort_id: 18,
        ancestor_id: "01ZK150100"
    },
    {
        id: "8180881",
        team_id: 999,
        name: "Storage99 매장P",
        sort_id: 19,
        ancestor_id: "01ZK150100"
    },
    {
        id: "8190881",
        team_id: 999,
        name: "Storage99 매장Q",
        sort_id: 20,
        ancestor_id: "01ZK150100"
    },
    {
        id: "82009881",
        team_id: 999,
        name: "Storage99 매장R",
        sort_id: 21,
        ancestor_id: "01ZK150100"
    },
    {
        id: "82109881",
        team_id: 999,
        name: "Storage99 매장S",
        sort_id: 22,
        ancestor_id: "01ZK150100"
    },
    {
        id: "82209881",
        team_id: 999,
        name: "Storage99 매장T",
        sort_id: 23,
        ancestor_id: "01ZK150100"
    },
    {
        id: "82309881",
        team_id: 999,
        name: "Storage99 매장U",
        sort_id: 24,
        ancestor_id: "01ZK150100"
    },
    {
        id: "82409881",
        team_id: 999,
        name: "Storage99 매장V",
        sort_id: 25,
        ancestor_id: "01ZK150100"
    },
    {
        id: "01ZK140190",
        team_id: 999,
        name: "Storage99지원파트",
        sort_id: 2,
        ancestor_id: "01ZK140191"
    },
    {
        id: "01ZK140200",
        team_id: 999,
        name: "생산물류본부",
        sort_id: 47,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK130102",
        team_id: 999,
        name: "품질관리팀",
        sort_id: 7,
        ancestor_id: "01ZK140200"
    },
    {
        id: "01ZK130110",
        team_id: 999,
        name: "물류품질파트",
        sort_id: 1,
        ancestor_id: "01ZK130102"
    },
    {
        id: "01ZK140260",
        team_id: 999,
        name: "물류담당",
        sort_id: 11,
        ancestor_id: "01ZK140200"
    },
    {
        id: "40200000",
        team_id: 999,
        name: "물류지원팀",
        sort_id: 1,
        ancestor_id: "01ZK140260"
    },
    {
        id: "40100000",
        team_id: 999,
        name: "물류운영팀",
        sort_id: 2,
        ancestor_id: "01ZK140260"
    },
    {
        id: "01ZK131550",
        team_id: 999,
        name: "대외협력실",
        sort_id: 48,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK131510",
        team_id: 999,
        name: "동반성장팀",
        sort_id: 2,
        ancestor_id: "01ZK131550"
    },
    {
        id: "01ZK131460",
        team_id: 999,
        name: "홍보담당",
        sort_id: 3,
        ancestor_id: "01ZK131550"
    },
    {
        id: "01ZK131500",
        team_id: 999,
        name: "홍보팀",
        sort_id: 1,
        ancestor_id: "01ZK131460"
    },
    {
        id: "01ZK180000",
        team_id: 999,
        name: "준법경영실",
        sort_id: 49,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK130720",
        team_id: 999,
        name: "법무팀",
        sort_id: 1,
        ancestor_id: "01ZK180000"
    },
    {
        id: "01ZK130725",
        team_id: 999,
        name: "경영진단팀",
        sort_id: 2,
        ancestor_id: "01ZK180000"
    },
    {
        id: "01ZK130727",
        team_id: 999,
        name: "개인정보보호파트",
        sort_id: 3,
        ancestor_id: "01ZK180000"
    },
    {
        id: "01ZK130300",
        team_id: 999,
        name: "디지털전략실",
        sort_id: 51,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK130307",
        team_id: 999,
        name: "IT전략기획팀",
        sort_id: 1,
        ancestor_id: "01ZK130300"
    },
    {
        id: "01ZK130306",
        team_id: 999,
        name: "IT플랫폼팀",
        sort_id: 2,
        ancestor_id: "01ZK130300"
    },
    {
        id: "01ZK130301",
        team_id: 999,
        name: "IT운영팀",
        sort_id: 3,
        ancestor_id: "01ZK130300"
    },
    {
        id: "01ZK130303",
        team_id: 999,
        name: "IT인프라팀",
        sort_id: 4,
        ancestor_id: "01ZK130300"
    },
    {
        id: "01ZK130305",
        team_id: 999,
        name: "정보보호팀",
        sort_id: 5,
        ancestor_id: "01ZK130300"
    },
    {
        id: "01ZK190000",
        team_id: 999,
        name: "마케팅담당",
        sort_id: 61,
        ancestor_id: "01ZK000000"
    },
    {
        id: "MHO016000",
        team_id: 999,
        name: "마케팅커뮤니케이션팀",
        sort_id: 1,
        ancestor_id: "01ZK190000"
    },
    {
        id: "01ZK191000",
        team_id: 999,
        name: "마케팅팀",
        sort_id: 4,
        ancestor_id: "01ZK190000"
    },
    {
        id: "01ZK190100",
        team_id: 999,
        name: "데이터마케팅파트",
        sort_id: 1,
        ancestor_id: "01ZK191000"
    },
    {
        id: "01ZK190200",
        team_id: 999,
        name: "상품기획파트",
        sort_id: 2,
        ancestor_id: "01ZK191000"
    },
    {
        id: "01ZK170000",
        team_id: 999,
        name: "R&D센터",
        sort_id: 62,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK170210",
        team_id: 999,
        name: "메뉴개발1팀",
        sort_id: 4,
        ancestor_id: "01ZK170000"
    },
    {
        id: "01ZK170220",
        team_id: 999,
        name: "메뉴개발2팀",
        sort_id: 5,
        ancestor_id: "01ZK170000"
    },
    {
        id: "MHO023000",
        team_id: 999,
        name: "메뉴개발3팀",
        sort_id: 7,
        ancestor_id: "01ZK170000"
    },
    {
        id: "MHO023100",
        team_id: 999,
        name: "메인디시개발파트",
        sort_id: 1,
        ancestor_id: "MHO023000"
    },
    {
        id: "01ZK130870",
        team_id: 999,
        name: "해외메뉴개발파트",
        sort_id: 8,
        ancestor_id: "01ZK170000"
    },
    {
        id: "01ZK184000",
        team_id: 999,
        name: "디자인담당",
        sort_id: 63,
        ancestor_id: "01ZK000000"
    },
    {
        id: "01ZK131150",
        team_id: 999,
        name: "인테리어팀",
        sort_id: 3,
        ancestor_id: "01ZK184000"
    },
    {
        id: "01ZK131110",
        team_id: 999,
        name: "SI파트",
        sort_id: 1,
        ancestor_id: "01ZK131150"
    },
    {
        id: "01ZK131120",
        team_id: 999,
        name: "PM파트",
        sort_id: 2,
        ancestor_id: "01ZK131150"
    },
    {
        id: "01ZK131160",
        team_id: 999,
        name: "VC팀",
        sort_id: 4,
        ancestor_id: "01ZK184000"
    },
    {
        id: "01ZK131170",
        team_id: 999,
        name: "그래픽파트",
        sort_id: 2,
        ancestor_id: "01ZK131160"
    }
];
