import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { CollectionNames } from '@Server/document/shared.js';


const API_NAME = 'currency-api';
const Rebar = useRebar();
const db =Rebar.database.useDatabase()

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof useApi>;
    }
}



// global.d.ts
import { Account } from '@Shared/types/account.js';
import { Character } from '@Shared/types/character.js';


declare module '@Shared/types/account.js' {
    export interface Account {
        points?: number;
    }
}

    
function useApi() {
    async  function add (player:alt.Player,type:string,amount: number,characterid:number) {
        if(!player){
            const playerdata = await db.getMany<{ _id: string } &Character>({id:characterid},CollectionNames.Characters,)
            if(!playerdata){
                return false
            }
            if(type === 'cash') {
                const cash = playerdata[0].cash
                if (!cash) {
                    playerdata[0].cash = amount;
                    db.update({cash:playerdata[0].cash},CollectionNames.Characters)
                    return true
                }
                const newValue = cash + amount
                playerdata[0].cash = newValue;
                db.update({cash:playerdata[0].cash},CollectionNames.Characters)
                return true
            }
                
                if(type === 'bank') {
                    const bank = playerdata[0].bank
                    if (!bank) {
                        playerdata[0].bank = amount;
                        db.update({bank:playerdata[0].bank},CollectionNames.Characters)
                        return true
                    }
                    const newValue = bank + amount
                    playerdata[0].bank = newValue;
                    db.update({bank:playerdata[0].bank},CollectionNames.Characters)
                    return true
                }

                    
                    if(type === 'points') {
                        const accountdata = db.getMany<{ _id: string } & Account>({_id:playerdata[0].account_id},CollectionNames.Accounts,)
                        if(!accountdata){
                            return false
                        }
                        const points = accountdata[0].points
                        if (!points) {
                            accountdata[0].points = amount;
                            db.update({points:accountdata[0].points},CollectionNames.Accounts)
                            return true
                        }
                        const newValue = points + amount
                        accountdata[0].points = newValue;
                        db.update({points:accountdata[0].points},CollectionNames.Accounts)
                        return true
                    }
          
            
        }
        if(type === 'cash') {
            const cash = Rebar.document.character.useCharacter(player).getField('cash');
            if (!cash) {
                Rebar.document.character.useCharacter(player).set('cash', amount);
                return true
            }
            const newValue = cash + amount
            Rebar.document.character.useCharacter(player).set('cash', newValue);
            return true
        }

        if(type === 'bank') {
            const bank = Rebar.document.character.useCharacter(player).getField('bank');
            if (!bank) {
                Rebar.document.character.useCharacter(player).set('bank', amount);
                return true
               
            }
            const newValue = bank + amount
            Rebar.document.character.useCharacter(player).set('bank', newValue);
            return true
       }
           
            if(type === 'points') {
                const points = Rebar.document.account.useAccount(player).getField('points');
                if (!points) {
                    Rebar.document.account.useAccount(player).set('points', amount);
                    return true
                }
                const newValue = points + amount
                Rebar.document.account.useAccount(player).set('points', newValue);
                return true
            }
        return false;
        }
                   
            
    

     return {
        add,
     }



}
    




Rebar.useApi().register(API_NAME, useApi());


