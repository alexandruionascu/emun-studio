import * as React from 'react'
import { Animated } from 'react-animated-css'
import ClipLoader from 'react-spinners/ClipLoader'
import { css } from '@emotion/react'
import { SmallBorderedContainer } from './components/BorderedContainer'

const override = css`
    position: absolute;
    background: white;
`

interface Props {
    variableName: string
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
                style={{margin: 10}}
            >
                <Animated
                    animationIn="flipInX"
                    animationOut="flipInY"
                    animateOnMount={false}
                    isVisible={this.state.isBoxVisible}
                >
                    <SmallBorderedContainer>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minWidth: 25,
                                height: 25,
                                borderRadius: 7,
                                padding: 10,
                                color: '#0A0100',
                                borderImageSlice: 1,
                                textAlign: 'center',
                                boxSizing: 'content-box',
                                filter: this.props.loading
                                    ? 'blur(1px)'
                                    : 'unset',
                                position: 'relative',
                                fontWeight: 500,
                                fontFamily: 'Montserrat',
                                lineHeight: 1.5,
                                overflowY: 'auto',
                                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
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
                    </SmallBorderedContainer>
                </Animated>
                <div
                    style={{
                        fontFamily: 'Montserrat',
                        fontWeight: 300 /* this.props.isCurrentIdentifier ? 'bold' : 'normal' */,
                        textAlign: 'center',
                    }}
                >
                    <span
                        className="box-label btn p-1 shadow-sm"
                        style={{
                            color: '#0A0100',
                            fontWeight: 400,
                            marginTop: 5,
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
