import { JSX } from "solid-js";

export interface GenericProps<T = unknown> extends JSX.IntrinsicAttributes {
    id ?: string;
    class ?: string;
    style ?: JSX.CSSProperties | string;
    ref ?: T | ((e : T) => void);
    contentEditable ?: boolean | "inherit";
    spellcheck ?: boolean;
    autoCapitalize ?: JSX.HTMLAutocapitalize;
}

export const getGenericProps = <T = unknown>({
    id,
    class: cls,
    style,
    ref,
    contentEditable,
    spellcheck,
    autoCapitalize,
} : GenericProps<T>) : GenericProps<T> => ({
        id,
        class: cls,
        style,
        ref,
        contentEditable,
        spellcheck,
        autoCapitalize,
    });

export type ClassValue = string | null | undefined | ClassValue[];
export type Variant = Record<string, Record<string, ClassValue>>;

export interface GenericVariants {
    container : { true : string };
    row : { true : string };
    col : { true : string };
    columns : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    span : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
        7 : string;
        8 : string;
        9 : string;
        10 : string;
        11 : string;
        12 : string;
    };
    offset : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
        7 : string;
        8 : string;
        9 : string;
        10 : string;
        11 : string;
        12 : string;
    };
    gutter : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    gutterX : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    gutterY : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    padding : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingX : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingY : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingTop : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingRight : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingBottom : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    paddingLeft : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    margin : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginX : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginY : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginTop : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginRight : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginBottom : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    marginLeft : {
        1 : string;
        2 : string;
        3 : string;
        4 : string;
        5 : string;
        6 : string;
    };
    flex : {
        h : string;
        v : string;
    };
    flexHAlign : {
        left : string;
        center : string;
        right : string;
        spaced : string;
    };
    flexVAlign : {
        top : string;
        center : string;
        bottom : string;
        spaced : string;
    };
}

export const getGenericVariants = <T extends Variant>(base : T) : GenericVariants & T => ({
    container: { true: "flex" },
    row: { true: "row" },
    col: { true: "col" },
    columns: {
        1: "c1",
        2: "c2",
        3: "c3",
        4: "c4",
        5: "c5",
        6: "c6",
    },
    span: {
        1: "w1",
        2: "w2",
        3: "w3",
        4: "w4",
        5: "w5",
        6: "w6",
        7: "w7",
        8: "w8",
        9: "w9",
        10: "w10",
        11: "w11",
        12: "w12",
    },
    offset: {
        1: "o1",
        2: "o2",
        3: "o3",
        4: "o4",
        5: "o5",
        6: "o6",
        7: "o7",
        8: "o8",
        9: "o9",
        10: "o10",
        11: "o11",
        12: "o12",
    },
    gutter: {
        1: "g1",
        2: "g2",
        3: "g3",
        4: "g4",
        5: "g5",
        6: "g6",
    },
    gutterX: {
        1: "gx1",
        2: "gx2",
        3: "gx3",
        4: "gx4",
        5: "gx5",
        6: "gx6",
    },
    gutterY: {
        1: "gy1",
        2: "gy2",
        3: "gy3",
        4: "gy4",
        5: "gy5",
        6: "gy6",
    },
    padding: {
        1: "p1",
        2: "p2",
        3: "p3",
        4: "p4",
        5: "p5",
        6: "p6",
    },
    paddingX: {
        1: "px1",
        2: "px2",
        3: "px3",
        4: "px4",
        5: "px5",
        6: "px6",
    },
    paddingY: {
        1: "py1",
        2: "py2",
        3: "py3",
        4: "py4",
        5: "py5",
        6: "py6",
    },
    paddingTop: {
        1: "pt1",
        2: "pt2",
        3: "pt3",
        4: "pt4",
        5: "pt5",
        6: "pt6",
    },
    paddingRight: {
        1: "pr1",
        2: "pr2",
        3: "pr3",
        4: "pr4",
        5: "pr5",
        6: "pr6",
    },
    paddingBottom: {
        1: "pb1",
        2: "pb2",
        3: "pb3",
        4: "pb4",
        5: "pb5",
        6: "pb6",
    },
    paddingLeft: {
        1: "pl1",
        2: "pl2",
        3: "pl3",
        4: "pl4",
        5: "pl5",
        6: "pl6",
    },
    margin: {
        1: "m1",
        2: "m2",
        3: "m3",
        4: "m4",
        5: "m5",
        6: "m6",
    },
    marginX: {
        1: "mx1",
        2: "mx2",
        3: "mx3",
        4: "mx4",
        5: "mx5",
        6: "mx6",
    },
    marginY: {
        1: "my1",
        2: "my2",
        3: "my3",
        4: "my4",
        5: "my5",
        6: "my6",
    },
    marginTop: {
        1: "mt1",
        2: "mt2",
        3: "mt3",
        4: "mt4",
        5: "mt5",
        6: "mt6",
    },
    marginRight: {
        1: "mr1",
        2: "mr2",
        3: "mr3",
        4: "mr4",
        5: "mr5",
        6: "mr6",
    },
    marginBottom: {
        1: "mb1",
        2: "mb2",
        3: "mb3",
        4: "mb4",
        5: "mb5",
        6: "mb6",
    },
    marginLeft: {
        1: "ml1",
        2: "ml2",
        3: "ml3",
        4: "ml4",
        5: "ml5",
        6: "ml6",
    },
    flex: {
        h: "flex h",
        v: "flex v",
    },
    flexHAlign: {
        left: "h-left",
        center: "h-center",
        right: "h-right",
        spaced: "h-spaced",
    },
    flexVAlign: {
        top: "v-top",
        center: "v-center",
        bottom: "v-bottom",
        spaced: "v-spaced",
    },
    ...base,
});
