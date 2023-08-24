import jwt from 'jsonwebtoken'


export const tokenFunction = ({
    payload = {} || '',
    signature = process.env.TOKEN_SIGNATURE,
    expiresIn = 1200,
    generate = true
})=>{
    if(typeof payload == 'object' && generate){
        if(Object.keys(payload).length){
            let token = '';
            if(expiresIn > 0){
                token = jwt.sign(payload,signature,{expiresIn});
            }
            else{
                token = jwt.sign(payload,signature);
                console.log('token generation here without expiration');
            }
            return token
        }
        else{
            return false
        }
    }
    else if(typeof payload == 'string' && !generate){
        if(payload != ""){
            const decoded = jwt.verify(payload,signature);
            return decoded
        }
        else{
            return false
        }
    }
}