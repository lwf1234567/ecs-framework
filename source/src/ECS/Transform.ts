class Transform {
    /** 相关联的实体 */
    public readonly entity: Entity;
    private _children: Transform[];
    private _parent: Transform;

    private _localPosition: Vector2;
    private _localRotation: number = 0;
    private _localScale: Vector2;

    private _translationMatrix: Matrix2D;
    private _rotationMatrix: Matrix2D;
    private _scaleMatrix: Matrix2D;

    private _worldTransform = Matrix2D.identity;
    private _worldToLocalTransform = Matrix2D.identity;
    private _worldInverseTransform = Matrix2D.identity;

    private _rotation: number = 0;
    private _position: Vector2;
    private _scale: Vector2;

    private _localTransform;

    public get childCount(){
        return this._children.length;
    }

    constructor(entity: Entity){
        this.entity = entity;
        this._scale = this._localScale = Vector2.One;
        this._children = [];
    }

    public getChild(index: number){
        return this._children[index];
    }

    public get parent(){
        return this._parent;
    }

    public set parent(value: Transform){
        this.setParent(value);
    }

    public setParent(parent: Transform){
        if (this._parent == parent)
            return this;

        if (this._parent)
            this._parent._children.remove(this);

        if (parent)
            parent._children.push(this);

        this._parent = parent;

        return this;
    }

    public get position(){
        this.updateTransform();
        if (!this.parent){
            this._position = this._localPosition;
        }else{
            this.parent.updateTransform();
            this._position = Vector2.transform(this._localPosition, this.parent._worldTransform);
        }
        
        return this._position;
    }

    public set position(value: Vector2){
        this.setPosition(value);
    }

    public get localPosition(){
        this.updateTransform();
        return this._localPosition;
    }

    public set localPosition(value: Vector2){
        this.setLocalPosition(value);
    }

    public setLocalPosition(localPosition: Vector2){
        if (localPosition == this._localPosition)
            return this;

        this._localPosition = localPosition;
        
        return this;
    }

    public setPosition(position: Vector2){
        if (position == this._position)
            return this;

        this._position = position;
        if (this.parent){
            this.localPosition = Vector2.transform(this._position, this._worldToLocalTransform);
        }else{
            this.localPosition = position;
        }

        for (let i = 0; i < this.entity.components.length; i ++){
            let component = this.entity.components[i];
            if (component.displayRender){
                component.displayRender.x = this.entity.scene.camera.transformMatrix.m31 + this.position.x;
                component.displayRender.y = this.entity.scene.camera.transformMatrix.m32 + this.position.y;
            }
        }

        return this;
    }

    public updateTransform(){
        if (this.parent)
            this.parent.updateTransform();

        this._translationMatrix = Matrix2D.createTranslation(this._localPosition.x, this._localPosition.y);
        this._rotationMatrix = Matrix2D.createRotation(this._localRotation);
        this._scaleMatrix = Matrix2D.createScale(this._localScale.x, this._localScale.y);

        this._localTransform = Matrix2D.multiply(this._scaleMatrix, this._rotationMatrix);
        this._localTransform = Matrix2D.multiply(this._localTransform, this._translationMatrix);

        if (!this.parent){
            this._worldTransform = this._localTransform;
            this._rotation = this._localRotation;
            this._scale = this._localScale;
        }else{
            this._worldTransform = Matrix2D.multiply(this._localTransform, this.parent._worldTransform);

            this._rotation = this._localRotation + this.parent._rotation;
            this._scale = Vector2.multiply( this.parent._scale, this._localScale);
        }
    }
}