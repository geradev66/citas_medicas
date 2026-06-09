import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    try{
        const token = req.headers.authorization

        if(!token){
            return res.status(401).json({error: 'No token provided'})
        }

        //formato "Beares Toekn"
        const cleanToken = token.split(' ')[1]
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch (error){
        res.status(401).json({error: 'Token invalido'})


    }
}

export default auth