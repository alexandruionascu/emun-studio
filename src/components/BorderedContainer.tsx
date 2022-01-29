export const BorderedContainer = (props: { children: any }) => {
    return (
        <div className="bordered-container">
            <div className="bordered-child">{props.children}</div>
        </div>
    )
}

export const SmallBorderedContainer = (props: { children: any }) => {
    return (
        <div className="bordered-container-small">
            <div className="bordered-child-small">{props.children}</div>
        </div>
    )
}