Supbase Tutorial


1. Learn SQL general and learn how to fetch and mutate date - learn how to join tables 
2. figure out how supabase does those things with their own API, paritucarlyl using javascript / react 


Tricky supabase workarounds 

1. inner join tables - https://supabase.com/blog/postgrest-9#resource-embedding-with-inner-joins
a. inner joining means combines two tables and only returning the rows that have shared column values or foreign keys in supabase 
b. this allows you to perform high level filtering, like only return the chat tables with participants that have the currently logged in user ID and reject other rows 
c. in SQL this is straight forward just use the JOIN keyboard and ON then specific the key/column to base the join. you can also have left and righ joins which retrun all values on left or right table and return matching joins on other tbales. Joins can also icluide more than just 2 tables, unlimited actually, join can also be self joins. 
d. in superbase, you first call your authority to talk to the database i,e supabase instance then .from methon to select the table you want, then SELECT.() method to select the column, this has to be done in quations '', use space to select other colums and use the syntax table(colum) with the same quations to select other tables. 
e. to perform an inner join, user the keyword '!inner' for examples supabase.from('messages').select('id, chatParticipants!inner('id)'). supabase will automatically link tables
based on fereign key


Creating profile tables from ODS codes
-ODS needs to be unique - onboarding will require, deleting from profile table and create an auth account 
- on click of contact I will extract the required table info from NHS digital API and create a profile then open a chat
- need to create a new row that shows whether organisation is with pharmEx or not 
- need to create a status table and link with organisation 

- onclick handler = check if a profile exists with ODS code - if it exists - check if a chat_id exists that contains auth.user and target organisaiton - if it exists then route to chat page with params of active chat_id being the chat_id that exists 
--- if the profile with ODS doesn't exist - run a create profile function - on complettion, create a chat with both partities and naigate to chat page with chat_id 
--- if the profile iwth ODS does exists but a chat_id with both parties does not exist then create a chat with both partities and navigate to chat page with chat_id 

Network -  create table with network ID - and colum 2 is auth.uuid and row 3 is networkFrinds - uuid 
        - underContacts - we will query from newtowkr table - select - networkFriendsID + join with fereign table profile info - where colum2 is auth.uuid. 
        - list these under contacts with filter options 

BroadCast - start with simple form and build from there - to your network ? X number of friend (plus preveiew) or broadcast to all nearby organisatation 
            - if network then - dropdown title - and message - send -> 
            - if all newar by then - select radius, maximu is 20miles - maps with pharmacies nearby - dropdown filter organisaiton type -> select all - deselect some organiaiton
            - take then ODS codes and map to profiles if they exists - if not add to cannot send to X org not part of pharmex - and blast message 
ChatBroadCAst Message Provision - 