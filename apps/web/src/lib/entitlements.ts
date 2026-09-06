export type Plan =
 'FREE'
|'STARTER'
|'PROFESSIONAL'
|'ENTERPRISE';


export const FEATURES = {

FREE:[
'dashboard',
'assets',
'maintenance',
],

STARTER:[
'dashboard',
'assets',
'maintenance',
'customers',
'projects',
'work_orders',
],

PROFESSIONAL:[
'dashboard',
'assets',
'maintenance',
'customers',
'projects',
'work_orders',
'intelligence',
],

ENTERPRISE:[
'*'
]

} as const;


export function canUse(
plan:Plan,
feature:string
){

if(
FEATURES[plan].includes('*' as never)
)
return true;


return FEATURES[plan]
.includes(feature as never);

}
