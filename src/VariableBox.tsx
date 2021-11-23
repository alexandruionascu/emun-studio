import * as React from 'react'
import { Animated } from 'react-animated-css'
import ClipLoader from 'react-spinners/ClipLoader'
import { css } from '@emotion/react'

const override = css`
    position: absolute;
    background: white;
`

interface Props {
    variableName: string
    colorOrder: number
    variableValue: number | string | boolean | null | undefined
    indexLabel?: number | string
    isCurrentIdentifier?: boolean
    loading: boolean
}

interface State {
    isComponentVisible: boolean
    isBoxVisible: boolean
}

class VariableBox extends React.Component<Props, State> {
    static defaultProps = {
        isCurrentIdentifier: false,
    }
    static backgrounds = ['#F3F2F9', '#F3F2F9', '#F3F2F9']

    constructor(props: Props) {
        super(props)

        this.state = {
            isComponentVisible: true,
            isBoxVisible: true,
        }
    }
    triggetOutAnimation() {
        this.setState({
            isComponentVisible: false,
        })
    }

    toggleAnimation() {
        this.setState({
            isBoxVisible: !this.state.isBoxVisible,
        })
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.variableValue !== nextProps.variableValue) {
            this.toggleAnimation()
        }
    }

    componentWillUnmount() {
        setTimeout(() => this.triggetOutAnimation(), 500)
    }

    render() {
        return (
            <Animated
                animationIn="bounceInRight"
                animationOut="bounceOutRight"
                isVisible={this.state.isComponentVisible}
            >
                <Animated
                    animationIn="flipInX"
                    animationOut="flipInY"
                    animateOnMount={false}
                    isVisible={this.state.isBoxVisible}
                >
                    <div
                        className="variable-box"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minWidth: 25,
                            height: 25,
                            borderRadius: 7,
                            padding: 10,
                            color: '#948E96',
                            borderImageSlice: 1,
                            textAlign: 'center',
                            boxSizing: 'content-box',
                            filter: this.props.loading ? 'blur(1px)' : 'unset',
                            position: 'relative',
                            fontWeight: 700,
                            fontFamily: 'Montserrat',
                            lineHeight: 1.5,
                            overflowY: 'auto',
                            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                            background:
                                VariableBox.backgrounds[
                                    this.props.colorOrder %
                                        VariableBox.backgrounds.length
                                ],
                        }}
                    >
                        {this.props.loading && (
                            <ClipLoader
                                color={'#948E96'}
                                loading={true}
                                css={override}
                                size={30}
                            />
                        )}
                        {`${this.props.variableValue}`}
                    </div>
                </Animated>
                <div
                    style={{
                        fontFamily: 'Montserrat',
                        fontWeight: 300 /* this.props.isCurrentIdentifier ? 'bold' : 'normal' */,
                        textAlign: 'center',
                        marginTop: 10,
                    }}
                >
                    <span
                        className="box-label btn p-1 shadow-sm"
                        style={{
                            color: '#948E96',
                            fontWeight: 500,
                            marginTop: 10,
                            fontFamily: 'Montserrat',
                            textAlign: 'center',
                        }}
                    >
                        {this.props.variableName}
                        <sub>{this.props.indexLabel}</sub>
                    </span>
                </div>
            </Animated>
        )
    }
}

export default VariableBox
